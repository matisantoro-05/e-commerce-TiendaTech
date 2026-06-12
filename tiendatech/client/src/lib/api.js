/**
 * TiendaTech — lib/api.js
 * Cliente Axios centralizado.
 *
 * Ubicación: /client/src/lib/api.js
 *
 * Tokens:
 *  - Rutas /admin/*  → ADMIN_SECRET (token estático del .env)
 *  - Rutas /auth/*   → JWT del usuario logueado
 *  - El interceptor global solo inyecta el JWT de usuario.
 *  - adminApi inyecta el token de admin directamente en cada llamada,
 *    sin pasar por el interceptor, evitando colisiones.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor: solo inyecta token de USUARIO (JWT) ────────────────────────
// Las rutas de admin tienen su propio helper que inyecta el token correcto.
api.interceptors.request.use((config) => {
  const userToken = localStorage.getItem('tiendatech_user_token');
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

// ─── Interceptor de respuesta: normalizar errores ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor.';
    return Promise.reject(new Error(message));
  }
);

// ─── Helper interno para requests de admin con su propio token ───────────────
// Crea una config con el Authorization del admin, sin tocar el interceptor.
const adminConfig = (extra = {}) => ({
  ...extra,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('tiendatech_admin_token') || ''}`,
    ...extra.headers,
  },
});

// ─── APIs por recurso ─────────────────────────────────────────────────────────

export const productsApi = {
  getAll:        (params = {}) => api.get('/products', { params }),
  getById:       (id)          => api.get(`/products/${id}`),
  getCategories: ()            => api.get('/products/categories'),
};

export const ordersApi = {
  create:      (payload)            => api.post('/orders', payload),
  getByNumber: (orderNumber, email) => api.get(`/orders/${orderNumber}`, { params: { email } }),
};

export const paymentApi = {
  createPreference: (orderId) => api.post('/payment/create-preference', { orderId }),
};

export const authApi = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  loginWithGoogle: (data) => api.post('/auth/google', data),
  getProfile:      ()     => api.get('/auth/profile'),
  updateProfile:   (data) => api.put('/auth/profile', data),
  getCart:         ()     => api.get('/auth/cart'),
  saveCart:        (cart) => api.put('/auth/cart', { cart }),
  getOrders:       ()     => api.get('/auth/orders'),
};

export const adminApi = {
  // Auth — pública, sin token
  login: (password) => api.post('/admin/login', { password }),

  // Dashboard — token de admin explícito
  getDashboard: () =>
    api.get('/admin/dashboard', adminConfig()),

  // Productos — token de admin explícito en cada llamada
  getProducts:   (params) =>
    api.get('/admin/products', adminConfig({ params })),

  createProduct: (data) =>
    api.post('/admin/products', data, adminConfig()),

  updateProduct: (id, data) =>
    api.put(`/admin/products/${id}`, data, adminConfig()),

  deleteProduct: (id, hard = false) =>
    api.delete(`/admin/products/${id}`, adminConfig({ params: hard ? { hard: 'true' } : {} })),

  toggleProduct: (id) =>
    api.patch(`/admin/products/${id}/toggle`, {}, adminConfig()),
};

export default api;