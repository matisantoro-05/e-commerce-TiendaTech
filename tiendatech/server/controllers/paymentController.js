/**
 * TiendaTech — controllers/paymentController.js
 * Integración con Mercado Pago SDK v2 (oficial Node.js).
 *
 * Ubicación: /server/controllers/paymentController.js
 *
 * Endpoints que controla:
 *   POST /api/payment/create-preference  → createPreference
 *   POST /api/payment/webhook            → handleWebhook
 *
 * Flujo completo:
 *   1. Frontend llama a POST /create-preference con el orderId
 *   2. Backend busca la orden, construye la preferencia de MP y devuelve init_point
 *   3. Usuario completa el pago en la página de MP
 *   4. MP llama al webhook con el resultado
 *   5. Backend actualiza el estado de la orden en DB
 */

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import Order from '../models/Order.js';

// ─── Inicializar cliente de Mercado Pago ──────────────────────────────────────
// Se instancia UNA sola vez al cargar el módulo para reutilizar la conexión.
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000, // ms — abortar si MP no responde en 5 segundos
  },
});

const preferenceClient = new Preference(mpClient);
const paymentClient    = new Payment(mpClient);

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 1: POST /api/payment/create-preference
//  Recibe el orderId, construye la preferencia de MP y devuelve el init_point.
//
//  Body: { orderId: "664abc..." }
//
//  Respuesta:
//  {
//    success: true,
//    data: {
//      preferenceId: "123456789-...",
//      initPoint:    "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
//      sandboxUrl:   "https://sandbox.mercadopago.com.ar/..."  (solo en desarrollo)
//    }
//  }
// ─────────────────────────────────────────────────────────────────────────────
export const createPreference = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el orderId para iniciar el pago.',
      });
    }

    // ── Buscar la orden en DB ──────────────────────────────────────────────
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada.',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `La orden ya fue procesada (estado: ${order.status}).`,
      });
    }

    // ── Construir ítems para Mercado Pago ─────────────────────────────────
    // MP requiere que unit_price sea en la moneda configurada en tu cuenta.
    // Para Argentina → ARS. Para otros países ajustar currency_id.
    const mpItems = order.items.map((item) => ({
      id:          item.productId.toString(),
      title:       item.name,
      description: item.brand,
      picture_url: item.image,
      quantity:    item.quantity,
      unit_price:  item.price,   // precio unitario en ARS
      currency_id: 'ARS',
    }));

    // ── URLs de retorno ────────────────────────────────────────────────────
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const preferenceData = {
      items: mpItems,

      payer: {
        name:    order.shippingAddress.fullName.split(' ').slice(0, -1).join(' ') || order.shippingAddress.fullName,
        surname: order.shippingAddress.fullName.split(' ').slice(-1)[0] || '',
        email:   order.shippingAddress.email,
        phone: {
          area_code: '011',
          number:    order.shippingAddress.phone.replace(/\D/g, ''),
        },
        address: {
          street_name:   order.shippingAddress.address,
          zip_code:      order.shippingAddress.postalCode,
        },
      },

      // URLs a las que MP redirige después del pago
      back_urls: {
        success: `${clientUrl}/checkout/success?orderId=${orderId}`,
        failure: `${clientUrl}/checkout/failure?orderId=${orderId}`,
        pending: `${clientUrl}/checkout/pending?orderId=${orderId}`,
      },

      // MP llamará a esta URL para notificar el resultado (IPN/Webhook)
      notification_url: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payment/webhook`,

      // Referencia externa — usamos nuestro orderNumber para identificar la orden
      external_reference: order.orderNumber,

      // Expiración de la preferencia (24 horas)
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

      // Modo auto-return: MP redirige automáticamente al back_url correspondiente
      auto_return: 'approved',

      // Información del vendedor
      statement_descriptor: 'TIENDATECH',
    };

    // ── Crear la preferencia en Mercado Pago ──────────────────────────────
    const preference = await preferenceClient.create({ body: preferenceData });

    // ── Guardar el preferenceId en la orden ───────────────────────────────
    order.payment.preferenceId = preference.id;
    await order.save();

    const isDev = process.env.NODE_ENV !== 'production';

    res.status(200).json({
      success: true,
      data: {
        preferenceId: preference.id,
        // init_point → URL de producción (cobro real)
        initPoint:    preference.init_point,
        // sandbox_init_point → URL de pruebas (sin cobro real)
        ...(isDev && { sandboxUrl: preference.sandbox_init_point }),
      },
    });
  } catch (error) {
    console.error('❌ [createPreference]', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la preferencia de pago.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 2: POST /api/payment/webhook
//  Mercado Pago llama a esta URL automáticamente cuando cambia el estado
//  de un pago. Actualiza la orden en DB según el resultado.
//
//  MP envía la notificación como query params:
//    ?id=<paymentId>&topic=payment   (IPN)
//  O como body JSON (Webhooks v2):
//    { action: "payment.updated", data: { id: "..." } }
//
//  IMPORTANTE: Este endpoint DEBE responder 200 rápidamente o MP reintentará.
// ─────────────────────────────────────────────────────────────────────────────
export const handleWebhook = async (req, res) => {
  // Responder 200 de inmediato para que MP no reintente
  res.status(200).send('OK');

  try {
    // Soportar tanto IPN (query) como Webhooks v2 (body)
    const paymentId = req.query.id || req.body?.data?.id;
    const topic     = req.query.topic || req.body?.type;

    // Solo nos interesan las notificaciones de tipo "payment"
    if (topic !== 'payment' || !paymentId) {
      return;
    }

    // ── Consultar el pago completo a la API de MP ─────────────────────────
    const paymentData = await paymentClient.get({ id: paymentId });

    const {
      status,           // approved | pending | rejected | cancelled | refunded
      status_detail,    // accredited | cc_rejected_insufficient_amount | etc.
      external_reference, // nuestro orderNumber
      payment_method_id,
      date_approved,
    } = paymentData;

    if (!external_reference) {
      console.warn('⚠️  Webhook sin external_reference:', paymentId);
      return;
    }

    // ── Buscar la orden por orderNumber ───────────────────────────────────
    const order = await Order.findOne({ orderNumber: external_reference });

    if (!order) {
      console.error(`❌ Webhook: orden "${external_reference}" no encontrada.`);
      return;
    }

    // ── Mapear el estado de MP al estado de nuestra orden ─────────────────
    const statusMap = {
      approved:  'paid',
      pending:   'pending',
      rejected:  'failed',
      cancelled: 'cancelled',
      refunded:  'refunded',
    };

    const newOrderStatus = statusMap[status] || 'pending';

    // ── Actualizar la orden ───────────────────────────────────────────────
    order.status                 = newOrderStatus;
    order.payment.paymentId      = paymentId.toString();
    order.payment.mpStatus       = status;
    order.payment.mpStatusDetail = status_detail;
    order.payment.paymentMethod  = payment_method_id;

    if (status === 'approved' && date_approved) {
      order.payment.paidAt = new Date(date_approved);

      // Mover a "processing" cuando el pago está confirmado y listo para preparar
      order.status = 'processing';
    }

    await order.save();

    console.log(
      `✅ Webhook procesado: Orden ${external_reference} → ` +
      `MP status: ${status} → Order status: ${order.status}`
    );
  } catch (error) {
    // No re-lanzar el error: ya respondimos 200 a MP.
    // Loguear para revisión manual.
    console.error('❌ [handleWebhook] Error al procesar notificación:', error.message);
  }
};