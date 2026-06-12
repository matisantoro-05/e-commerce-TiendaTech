/**
 * TiendaTech — routes/auth.routes.js
 *
 * Ubicación: /server/routes/auth.routes.js
 *
 *   POST /api/auth/register   → Crear cuenta
 *   POST /api/auth/login      → Login email + contraseña
 *   POST /api/auth/google     → Login / registro con Google
 *   GET  /api/auth/profile    → Ver perfil (protegido)
 *   PUT  /api/auth/profile    → Editar perfil (protegido)
 *   GET  /api/auth/cart       → Obtener carrito en DB (protegido)
 *   PUT  /api/auth/cart       → Guardar carrito en DB (protegido)
 *   GET  /api/auth/orders     → Historial de órdenes (protegido)
 */

import { Router }      from 'express';
import { requireUser } from '../middleware/auth.js';
import {
  register,
  login,
  loginWithGoogle,
  getProfile,
  updateProfile,
  getCart,
  saveCart,
  getOrderHistory,
} from '../controllers/authController.js';

const router = Router();

// Públicas
router.post('/register', register);
router.post('/login',    login);
router.post('/google',   loginWithGoogle);

// Protegidas con JWT
router.get('/profile',   requireUser, getProfile);
router.put('/profile',   requireUser, updateProfile);
router.get('/cart',      requireUser, getCart);
router.put('/cart',      requireUser, saveCart);
router.get('/orders',    requireUser, getOrderHistory);

export default router;