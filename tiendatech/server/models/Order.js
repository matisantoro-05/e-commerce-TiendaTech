/**
 * TiendaTech — models/Order.js
 * Esquema de Mongoose para órdenes de compra.
 *
 * Ubicación: /server/models/Order.js
 *
 * Ciclo de vida de una orden:
 *   pending → paid → processing → shipped → delivered
 *                 ↘ failed (pago rechazado)
 *                 ↘ cancelled (cancelado por el usuario)
 *                 ↘ refunded  (reembolsado)
 */

import mongoose from 'mongoose';

// ─── Sub-esquema: ítem dentro de la orden ────────────────────────────────────
// Snapshot del producto al momento de la compra.
// NUNCA guardar solo el productId — si el precio cambia mañana,
// la orden histórica debe reflejar lo que el usuario pagó realmente.
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },   // snapshot nombre
    brand:    { type: String, required: true },   // snapshot marca
    image:    { type: String, required: true },   // snapshot imagen principal
    price:    { type: Number, required: true },   // precio unitario al momento de compra
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },   // price × quantity
  },
  { _id: false }
);

// ─── Sub-esquema: datos de envío ─────────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, trim: true, lowercase: true },
    phone:      { type: String, required: true, trim: true },
    address:    { type: String, required: true, trim: true },  // calle + número
    apartment:  { type: String, trim: true, default: '' },     // piso/depto (opcional)
    city:       { type: String, required: true, trim: true },
    province:   { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country:    { type: String, required: true, default: 'Argentina' },
  },
  { _id: false }
);

// ─── Sub-esquema: información del pago de Mercado Pago ───────────────────────
const paymentInfoSchema = new mongoose.Schema(
  {
    // ID de la preferencia generada por MP (devuelto al crear la preferencia)
    preferenceId:  { type: String, default: null },

    // ID del pago confirmado (llegado por webhook de MP)
    paymentId:     { type: String, default: null },

    // Estado interno de MP: approved, pending, rejected, cancelled, refunded
    mpStatus:      { type: String, default: null },

    // Detalle del estado: accredited, cc_rejected_insufficient_amount, etc.
    mpStatusDetail: { type: String, default: null },

    // Método de pago usado: credit_card, debit_card, account_money, ticket, etc.
    paymentMethod: { type: String, default: null },

    // Timestamp exacto cuando MP confirmó el pago
    paidAt: { type: Date, default: null },
  },
  { _id: false }
);

// ─── Esquema principal: Order ─────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── Número de orden legible para el usuario ──────────────────────────────
    // Formato: TT-20240715-XXXXX (TiendaTech + fecha + random)
    orderNumber: {
      type:   String,
      unique: true,
    },

    // ── Ítems comprados (snapshots) ──────────────────────────────────────────
    items: {
      type:     [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message:   'La orden debe contener al menos un producto.',
      },
    },

    // ── Totales ──────────────────────────────────────────────────────────────
    subtotal:      { type: Number, required: true, min: 0 }, // suma de items sin envío
    shippingCost:  { type: Number, default: 0,     min: 0 }, // costo de envío
    discount:      { type: Number, default: 0,     min: 0 }, // descuentos aplicados
    total:         { type: Number, required: true, min: 0 }, // lo que efectivamente paga

    // ── Dirección de envío ───────────────────────────────────────────────────
    shippingAddress: {
      type:     shippingAddressSchema,
      required: true,
    },

    // ── Estado de la orden ───────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed', 'refunded'],
      default: 'pending',
    },

    // ── Información de pago de Mercado Pago ──────────────────────────────────
    payment: {
      type:    paymentInfoSchema,
      default: () => ({}),
    },

    // ── Usuario asociado (null si compró como invitado) ──────────────────────
    userId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // ── Notas internas (uso admin) ───────────────────────────────────────────
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Virtual: cantidad total de ítems ────────────────────────────────────────
orderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Hook pre-save: generar orderNumber ──────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderNumber) {
    const date   = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `TT-${date}-${random}`;
  }
  next();
});

// ─── Índices ──────────────────────────────────────────────────────────────────
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'shippingAddress.email': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.paymentId': 1 });
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;