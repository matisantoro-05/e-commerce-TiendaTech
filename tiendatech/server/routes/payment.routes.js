/**
 * TiendaTech — routes/payment.routes.js
 *
 * Ubicación: /server/routes/payment.routes.js
 *
 * Endpoints (prefijados con /api/payment en server.js):
 *
 *   POST /api/payment/create-preference   → Genera preferencia de MP y devuelve init_point
 *   POST /api/payment/webhook             → Recibe notificaciones IPN/Webhook de MP
 *
 * NOTA sobre el webhook:
 *   La URL debe ser pública y accesible por los servidores de Mercado Pago.
 *   En desarrollo, usar ngrok: `ngrok http 5000`
 *   y configurar SERVER_URL=https://xxxx.ngrok.io en el .env
 */

import { Router }              from 'express';
import { createPreference,
         handleWebhook }       from '../controllers/paymentController.js';

const router = Router();

// POST /api/payment/create-preference
// Body: { orderId: "664abc123..." }
router.post('/create-preference', createPreference);

// POST /api/payment/webhook
// Llamado automáticamente por los servidores de Mercado Pago.
// No requiere autenticación desde el cliente.
router.post('/webhook', handleWebhook);

export default router;