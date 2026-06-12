/**
 * TiendaTech — routes/order.routes.js
 *
 * Ubicación: /server/routes/order.routes.js
 */

import { Router }         from 'express';
import { optionalUser }   from '../middleware/auth.js';
import { createOrder,
         getOrderByNumber } from '../controllers/orderController.js';

const router = Router();

// optionalUser: adjunta req.userId si hay JWT, pero no bloquea si no hay.
// Así la orden queda asociada al usuario logueado sin obligar el login.
router.post('/', optionalUser, createOrder);
router.get('/:orderNumber', getOrderByNumber);

export default router;