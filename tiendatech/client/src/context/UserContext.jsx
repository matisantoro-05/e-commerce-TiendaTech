/**
 * TiendaTech — context/UserContext.jsx
 * Estado global del usuario registrado.
 *
 * Ubicación: /client/src/context/UserContext.jsx
 *
 * Responsabilidades:
 *  - Mantener el estado del usuario logueado (token + datos)
 *  - Exponer login(), loginWithGoogle(), register(), logout()
 *  - Al hacer login: fusionar carrito localStorage → carrito DB
 *  - Al hacer logout: vaciar carrito en memoria (localStorage se limpia solo)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../lib/api';

const UserContext = createContext(null);

const TOKEN_KEY = 'tiendatech_user_token';
const USER_KEY  = 'tiendatech_user_data';

export function UserProvider({ children, onLoginCartMerge, onLogoutClearCart, onRegisterSync }) {
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user,    setUser]    = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isLoggedIn = !!token && !!user;

  // Registrar la función de sync en el CartContext una vez que el UserProvider monta
  useEffect(() => {
    if (onRegisterSync) {
      onRegisterSync(syncCartToDBFn);
    }
  }, []); // eslint-disable-line

  // Persistir usuario en localStorage
  const persistUser = (userData, userToken) => {
    if (userData && userToken) {
      localStorage.setItem(TOKEN_KEY, userToken);
      localStorage.setItem(USER_KEY,  JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
  };

  const clearUser = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // ── Al iniciar, verificar si el token sigue siendo válido ────────────────
  useEffect(() => {
    if (!token) return;
    authApi.getProfile()
      .then((res) => setUser(res.data.data.user))
      .catch(() => clearUser()); // Token expirado → limpiar
  }, []); // eslint-disable-line

  // ── Login con email + contraseña ─────────────────────────────────────────
  const login = useCallback(async (email, password, localCart = []) => {
    setLoading(true);
    setError('');
    try {
      const res  = await authApi.login({ email, password });
      const { token: newToken, user: userData } = res.data.data;

      // Fusionar carrito localStorage con carrito en DB
      const mergedCart = mergeCarritos(localCart, userData.cart);

      // Guardar carrito fusionado en DB
      if (mergedCart.length > 0) {
        await authApi.saveCart(mergedCart);
      }

      persistUser({ ...userData, cart: mergedCart }, newToken);

      // Notificar al CartContext para que reemplace el carrito
      onLoginCartMerge?.(mergedCart);

      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesión.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [onLoginCartMerge]);

  // ── Login con Google ─────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (credential, localCart = []) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.loginWithGoogle({ credential });
      const { token: newToken, user: userData } = res.data.data;

      const mergedCart = mergeCarritos(localCart, userData.cart);
      if (mergedCart.length > 0) {
        await authApi.saveCart(mergedCart);
      }

      persistUser({ ...userData, cart: mergedCart }, newToken);
      onLoginCartMerge?.(mergedCart);

      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.message || 'Error al autenticar con Google.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [onLoginCartMerge]);

  // ── Registro ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData, localCart = []) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(formData);
      const { token: newToken, user: userData } = res.data.data;

      // Al registrarse, mover el carrito localStorage a DB
      if (localCart.length > 0) {
        await authApi.saveCart(localCart);
      }

      persistUser({ ...userData, cart: localCart }, newToken);
      onLoginCartMerge?.(localCart);

      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.message || 'Error al crear la cuenta.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [onLoginCartMerge]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearUser();
    onLogoutClearCart?.();
  }, [onLogoutClearCart]);

  // ── Actualizar perfil ────────────────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      const updated = res.data.data.user;
      setUser((prev) => ({ ...prev, ...updated }));
      localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...updated }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [user]);

  // ── Función de sync interna (referencia estable para pasar al CartContext) ─
  const syncCartToDBFn = useCallback(async (cart) => {
    const currentToken = localStorage.getItem('tiendatech_user_token');
    if (!currentToken) return;
    try {
      await authApi.saveCart(cart);
    } catch {
      // Silencioso
    }
  }, []);

  // ── Sincronizar carrito → DB (llamado por CartContext en cada cambio) ────
  const syncCartToDB = useCallback(async (cart) => {
    if (!isLoggedIn) return;
    try {
      await authApi.saveCart(cart);
    } catch {
      // Silencioso — no romper la UI si falla la sync
    }
  }, [isLoggedIn]);

  return (
    <UserContext.Provider value={{
      user, token, isLoggedIn, loading, error,
      login, loginWithGoogle, register, logout,
      updateProfile, syncCartToDB,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de <UserProvider>');
  return ctx;
}

// ─── Helper: fusionar carrito localStorage + carrito DB ──────────────────────
// Si el mismo producto está en ambos, se suma la cantidad (respetando stock).
function mergeCarritos(localCart, dbCart) {
  if (!localCart?.length && !dbCart?.length) return [];

  // Normalizar el carrito de DB al formato { product: {...}, quantity }
  const dbNormalizado = (dbCart || []).map((item) => ({
    product: {
      _id:    item.productId,
      name:   item.name,
      brand:  item.brand,
      price:  item.price,
      images: [item.image],
      stock:  item.stock,
    },
    quantity: item.quantity,
  }));

  // Construir mapa desde el carrito DB
  const map = new Map();
  dbNormalizado.forEach((item) => {
    map.set(item.product._id.toString(), item);
  });

  // Fusionar ítems del carrito local
  (localCart || []).forEach((item) => {
    const id = (item.product?._id || item.productId)?.toString();
    if (!id) return;

    if (map.has(id)) {
      const existing = map.get(id);
      const newQty   = existing.quantity + item.quantity;
      existing.quantity = Math.min(newQty, existing.product.stock);
    } else {
      map.set(id, item);
    }
  });

  return Array.from(map.values());
}