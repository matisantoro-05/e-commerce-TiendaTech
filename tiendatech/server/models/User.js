/**
 * TiendaTech — models/User.js
 * Esquema de usuario registrado.
 *
 * Ubicación: /server/models/User.js
 *
 * El carrito del usuario logueado se guarda aquí como array embebido.
 * Al hacer login, el carrito de localStorage se fusiona con este carrito.
 */

import mongoose from 'mongoose';

// ─── Sub-esquema: ítem del carrito ────────────────────────────────────────────
// Guardamos snapshot mínimo del producto para renderizar el carrito
// sin necesidad de hacer populate en cada request.
const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    brand:     { type: String, required: true },
    price:     { type: Number, required: true },
    image:     { type: String, required: true },
    stock:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// ─── Sub-esquema: dirección guardada ──────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    address:    { type: String, default: '' },
    apartment:  { type: String, default: '' },
    city:       { type: String, default: '' },
    province:   { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country:    { type: String, default: 'Argentina' },
  },
  { _id: false }
);

// ─── Esquema principal: User ──────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identidad ────────────────────────────────────────────────────────────
    fullName: {
      type:     String,
      required: [true, 'El nombre es obligatorio.'],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, 'El email es obligatorio.'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    phone: {
      type:    String,
      default: '',
      trim:    true,
    },

    // ── Autenticación ────────────────────────────────────────────────────────
    // password es null para usuarios registrados con Google
    password: {
      type:   String,
      select: false, // nunca se devuelve en queries por defecto
    },

    // googleId es null para usuarios con email/contraseña
    googleId: {
      type:   String,
      sparse: true, // permite null múltiple (unique pero nullable)
      unique: true,
    },

    // Foto de perfil (viene de Google o null)
    avatar: {
      type:    String,
      default: null,
    },

    // ── Dirección guardada ───────────────────────────────────────────────────
    savedAddress: {
      type:    addressSchema,
      default: () => ({}),
    },

    // ── Carrito en DB ────────────────────────────────────────────────────────
    cart: {
      type:    [cartItemSchema],
      default: [],
    },

    // ── Estado ───────────────────────────────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Virtual: tiene contraseña local ─────────────────────────────────────────
userSchema.virtual('hasPassword').get(function () {
  return !!this.password;
});

// ─── Virtual: tiene dirección completa ───────────────────────────────────────
userSchema.virtual('hasAddress').get(function () {
  const a = this.savedAddress;
  return !!(a?.address && a?.city && a?.province && a?.postalCode);
});

// ─── Índices ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

export default User;