/**
 * TiendaTech — routes/admin.routes.js
 *
 * Ubicación: /server/routes/admin.routes.js
 *
 * Endpoints (prefijados con /api/admin en server.js):
 *
 *   POST  /api/admin/login                  → Login (no requiere auth)
 *   GET   /api/admin/dashboard              → Estadísticas generales
 *   GET   /api/admin/products               → Listar todos los productos
 *   POST  /api/admin/products               → Crear producto
 *   PUT   /api/admin/products/:id           → Editar producto
 *   DELETE /api/admin/products/:id          → Eliminar / desactivar producto
 *   PATCH /api/admin/products/:id/toggle    → Activar / desactivar
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  adminLogin,
  getDashboard,
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} from '../controllers/adminController.js';

const router = Router();

// ── Pública: no requiere token ────────────────────────────────────────────────
router.post('/login', adminLogin);

// ── Protegidas: requireAdmin verifica el Bearer token ────────────────────────
router.get('/dashboard',           requireAdmin, getDashboard);

router.get('/products',            requireAdmin, adminGetProducts);
router.post('/products',           requireAdmin, createProduct);
router.put('/products/:id',        requireAdmin, updateProduct);
router.delete('/products/:id',     requireAdmin, deleteProduct);
router.patch('/products/:id/toggle', requireAdmin, toggleProduct);

export default router;