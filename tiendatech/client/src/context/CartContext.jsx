/**
 * TiendaTech — context/CartContext.jsx
 * Estado global del carrito con doble persistencia:
 *  - Usuario NO logueado → localStorage
 *  - Usuario SI logueado → localStorage + MongoDB (via UserContext.syncCartToDB)
 *
 * Ubicación: /client/src/context/CartContext.jsx
 */

import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tiendatech_cart';

// ─── Estado inicial ───────────────────────────────────────────────────────────
const initialState = { items: [], isOpen: false };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const idx = state.items.findIndex((i) => i.product._id === product._id);
      if (idx >= 0) {
        const updated = [...state.items];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(updated[idx].quantity + quantity, product.stock),
        };
        return { ...state, items: updated, isOpen: true };
      }
      return {
        ...state,
        items:  [...state.items, { product, quantity: Math.min(quantity, product.stock) }],
        isOpen: true,
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product._id !== action.payload) };

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) return { ...state, items: state.items.filter((i) => i.product._id !== productId) };
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stock) }
            : i
        ),
      };
    }
    case 'CLEAR_CART':   return { ...state, items: [] };
    case 'OPEN_CART':    return { ...state, isOpen: true };
    case 'CLOSE_CART':   return { ...state, isOpen: false };
    // HYDRATE: reemplaza todo el carrito (usado al login/logout)
    case 'HYDRATE':      return { ...state, items: action.payload, isOpen: false };
    default:             return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Ref para la función de sincronización con DB (inyectada desde main.jsx
  // para evitar dependencia circular CartContext ↔ UserContext)
  const syncCartToDB = useRef(null);

  // Registrar la función de sync — llamada desde main.jsx cuando UserProvider está listo
  const registerSyncFn = useCallback((fn) => {
    syncCartToDB.current = fn;
  }, []);

  // Hidratar desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persistir en localStorage + sincronizar con DB en cada cambio
  const syncDebounceRef = useRef(null);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));

    // Sync a DB con debounce de 800ms para no spamear en cambios rápidos
    if (syncCartToDB.current) {
      clearTimeout(syncDebounceRef.current);
      syncDebounceRef.current = setTimeout(() => {
        syncCartToDB.current(state.items);
      }, 800);
    }
  }, [state.items]);

  // ── Derivados ──────────────────────────────────────────────────────────────
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // ── Acciones ───────────────────────────────────────────────────────────────
  const addToCart     = useCallback((product, quantity = 1) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } }), []);

  const removeFromCart = useCallback((productId) =>
    dispatch({ type: 'REMOVE_ITEM', payload: productId }), []);

  const updateQuantity = useCallback((productId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } }), []);

  const clearCart  = useCallback(() => dispatch({ type: 'CLEAR_CART' }),  []);
  const openCart   = useCallback(() => dispatch({ type: 'OPEN_CART' }),   []);
  const closeCart  = useCallback(() => dispatch({ type: 'CLOSE_CART' }),  []);

  // Reemplazar todo el carrito — usado al login (merge) y logout (limpiar)
  const hydrateCart = useCallback((items) =>
    dispatch({ type: 'HYDRATE', payload: items }), []);

  return (
    <CartContext.Provider value={{
      cart: state.items, isOpen: state.isOpen, totalItems, totalPrice,
      addToCart, removeFromCart, updateQuantity, clearCart,
      openCart, closeCart, hydrateCart, registerSyncFn,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}