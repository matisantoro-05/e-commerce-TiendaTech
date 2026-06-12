/**
 * TiendaTech — context/AuthContext.jsx
 * Estado global de autenticación del panel de administración.
 *
 * Ubicación: /client/src/context/AuthContext.jsx
 */

import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tiendatech_admin_token';

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isAuthenticated = !!token;

  const login = useCallback(async (password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', { password });
      const { token: newToken } = res.data.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      return true;
    } catch (err) {
      setError(err.message || 'Contraseña incorrecta.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}