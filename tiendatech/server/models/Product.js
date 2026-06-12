/**
 * TiendaTech — models/Product.js
 * Esquema de Mongoose para productos de hardware/periféricos gamer.
 *
 * Ubicación: /server/models/Product.js
 */

import mongoose from 'mongoose';

// ─── Sub-esquema: Especificaciones Técnicas ───────────────────────────────────
// Almacenado como mapa clave→valor para máxima flexibilidad entre categorías.
// Ejemplo teclado: { "Switch": "Cherry MX Red", "Layout": "TKL" }
// Ejemplo monitor: { "Panel": "IPS", "Resolución": "2560x1440" }
const specsSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false } // No necesitamos _id en cada spec
);

// ─── Esquema principal: Product ───────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    // ── Identidad del producto ───────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio.'],
      trim: true,
      maxlength: [150, 'El nombre no puede superar los 150 caracteres.'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // Se genera automáticamente desde 'name' en el hook pre-save
    },

    description: {
      type: String,
      required: [true, 'La descripción del producto es obligatoria.'],
      trim: true,
      maxlength: [2000, 'La descripción no puede superar los 2000 caracteres.'],
    },

    // ── Categorización ───────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      enum: {
        values: ['Teclados', 'Mouses', 'Monitores', 'Auriculares', 'PCs', 'Sillas', 'Accesorios'],
        message: 'Categoría inválida: {VALUE}',
      },
    },

    brand: {
      type: String,
      required: [true, 'La marca es obligatoria.'],
      trim: true,
    },

    // ── Precios ──────────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
    },

    // Precio de lista original (para mostrar tachado + % de descuento)
    originalPrice: {
      type: Number,
      default: null,
      min: [0, 'El precio original no puede ser negativo.'],
    },

    // Indica si hay oferta activa (se calcula también via virtual)
    isOnSale: {
      type: Boolean,
      default: false,
    },

    // ── Imágenes ─────────────────────────────────────────────────────────────
    // Array de URLs — la primera es la imagen principal
    images: {
      type: [String],
      required: [true, 'Se requiere al menos una imagen.'],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'El producto debe tener al menos una imagen.',
      },
    },

    // ── Inventario ───────────────────────────────────────────────────────────
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio.'],
      min: [0, 'El stock no puede ser negativo.'],
      default: 0,
    },

    // ── Especificaciones técnicas (array de {key, value}) ────────────────────
    specs: {
      type: [specsSchema],
      default: [],
    },

    // ── Valoraciones ─────────────────────────────────────────────────────────
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Visibilidad ──────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos

    // Habilitar virtuals en JSON y Object (para que discount% aparezca en la API)
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: porcentaje de descuento ────────────────────────────────────────
productSchema.virtual('discountPercent').get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// ─── Virtual: imagen principal ───────────────────────────────────────────────
productSchema.virtual('mainImage').get(function () {
  return this.images?.[0] ?? null;
});

// ─── Virtual: en stock ───────────────────────────────────────────────────────
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// ─── Hook pre-save: generar slug desde el nombre ─────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9\s-]/g, '')    // solo alfanumérico
      .trim()
      .replace(/\s+/g, '-')            // espacios → guiones
      .replace(/-+/g, '-');            // guiones múltiples → uno

    // Agregar fragmento del ObjectId para garantizar unicidad
    this.slug = `${this.slug}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// ─── Índices para búsqueda y filtrado eficiente ───────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, isFeatured: -1 });
// Índice de texto para búsqueda full-text por nombre y descripción
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;