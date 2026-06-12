/**
 * TiendaTech — seed/products.seed.js
 * Script para poblar la base de datos con productos de muestra.
 *
 * Ubicación: /server/seed/products.seed.js
 *
 * Uso:
 *   node seed/products.seed.js           → inserta productos
 *   node seed/products.seed.js --delete  → limpia la colección
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import Product from '../models/Product.js';

// ─── Datos de muestra ─────────────────────────────────────────────────────────
// Las URLs de imagen usan Unsplash para tener fotos reales de inmediato.
// En producción, reemplazarlas por tus propias imágenes en S3/Cloudinary.

const SAMPLE_PRODUCTS = [
  // ── 1. TECLADO ──────────────────────────────────────────────────────────────
  {
    name: 'Keychron Q3 Pro TKL Wireless',
    description:
      'Teclado mecánico premium TKL inalámbrico con hot-swap, switches intercambiables sin soldar y cuerpo de aluminio CNC de 5° de ángulo. Perfecta combinación de precisión profesional y libertad inalámbrica para gaming y productividad de alto rendimiento.',
    category: 'Teclados',
    brand: 'Keychron',
    price: 189990,
    originalPrice: 229990,
    isOnSale: true,
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    ],
    stock: 24,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 142,
    specs: [
      { key: 'Layout',        value: 'TKL (87 teclas)' },
      { key: 'Switch',        value: 'Gateron G Pro Red (hot-swap)' },
      { key: 'Conectividad',  value: 'Bluetooth 5.1 / USB-C' },
      { key: 'Batería',       value: '4,000 mAh (~300 horas)' },
      { key: 'Iluminación',   value: 'RGB per-key sur south-facing' },
      { key: 'Cuerpo',        value: 'Aluminio CNC anodizado negro' },
      { key: 'Lube',          value: 'Pre-lubricado de fábrica' },
      { key: 'Polling Rate',  value: '1,000 Hz (cableado)' },
    ],
  },

  // ── 2. MOUSE ────────────────────────────────────────────────────────────────
  {
    name: 'Logitech G Pro X Superlight 2',
    description:
      'El mouse más ultraligero del mercado para gaming competitivo, con tan solo 60 gramos. Sensor HERO 2 de 32,000 DPI para tracking perfecto a cualquier velocidad, sin aceleración ni suavizado. Diseñado junto a los mejores esports players del mundo.',
    category: 'Mouses',
    brand: 'Logitech',
    price: 149990,
    originalPrice: null,
    isOnSale: false,
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    ],
    stock: 38,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 287,
    specs: [
      { key: 'Peso',          value: '60g (sin cable)' },
      { key: 'Sensor',        value: 'HERO 2 — 32,000 DPI máx.' },
      { key: 'Conectividad',  value: 'LIGHTSPEED 2.4GHz inalámbrico' },
      { key: 'Batería',       value: 'Hasta 95 horas' },
      { key: 'Botones',       value: '5 + scroll' },
      { key: 'Polling Rate',  value: '2,000 Hz' },
      { key: 'Click latency', value: '< 1ms' },
      { key: 'Pies PTFE',     value: 'Zero-additive 100% PTFE' },
    ],
  },

  // ── 3. MONITOR ──────────────────────────────────────────────────────────────
  {
    name: 'Samsung Odyssey G7 32" QHD 240Hz',
    description:
      'Monitor curvo QHD de 32" con panel VA de 1ms, frecuencia de refresco de 240Hz y curvatura inmersiva 1000R. DisplayHDR 600 para contraste dramático y colores vibrantes. Compatible con G-Sync y FreeSync Premium Pro para eliminar el tearing.',
    category: 'Monitores',
    brand: 'Samsung',
    price: 699990,
    originalPrice: 849990,
    isOnSale: true,
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c228b2d997?w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
    ],
    stock: 8,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 94,
    specs: [
      { key: 'Tamaño',        value: '32 pulgadas' },
      { key: 'Resolución',    value: '2560 × 1440 (QHD)' },
      { key: 'Panel',         value: 'VA (1000R curvatura)' },
      { key: 'Refresco',      value: '240Hz' },
      { key: 'Tiempo resp.',  value: '1ms (GtG)' },
      { key: 'HDR',           value: 'DisplayHDR 600' },
      { key: 'Sync',          value: 'G-Sync Compatible / FreeSync Pro' },
      { key: 'Puertos',       value: '2× HDMI 2.0, 1× DP 1.4, 2× USB 3.0' },
    ],
  },

  // ── 4. AURICULARES ──────────────────────────────────────────────────────────
  {
    name: 'SteelSeries Arctis Nova Pro Wireless',
    description:
      'Auriculares gaming inalámbricos de alta fidelidad con sistema de doble batería intercambiable y audio de calidad de estudio. Microfóno retráctil con cancelación activa de ruido de grado profesional. Compatible con PC, PlayStation y Nintendo Switch simultáneamente.',
    category: 'Auriculares',
    brand: 'SteelSeries',
    price: 429990,
    originalPrice: 489990,
    isOnSale: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    stock: 15,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 173,
    specs: [
      { key: 'Conectividad',  value: '2.4GHz + Bluetooth 5.0' },
      { key: 'Drivers',       value: '40mm neodimio' },
      { key: 'Frecuencia',    value: '10Hz – 40,000Hz' },
      { key: 'Batería',       value: 'Sistema dual — hasta 44 horas total' },
      { key: 'ANC',           value: 'Cancelación activa de ruido' },
      { key: 'Micrófono',     value: 'Retráctil con ClearCast AI' },
      { key: 'Compatibilidad', value: 'PC / PS4 / PS5 / Nintendo Switch' },
      { key: 'Peso',          value: '338g' },
    ],
  },

  // ── 5. PC GAMER ─────────────────────────────────────────────────────────────
  {
    name: 'PC Gamer TiendaTech Apex RTX 4070',
    description:
      'Torre gaming de alto rendimiento ensamblada con los mejores componentes de la industria. Procesador Intel Core i7-14700K, gráfica NVIDIA RTX 4070 con 12GB GDDR6X y refrigeración líquida all-in-one de 360mm. Lista para correr cualquier título a 1440p con 144fps o más.',
    category: 'PCs',
    brand: 'TiendaTech',
    price: 2499990,
    originalPrice: 2799990,
    isOnSale: true,
    images: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
    ],
    stock: 5,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 31,
    specs: [
      { key: 'CPU',           value: 'Intel Core i7-14700K (20C/28T, 5.6GHz)' },
      { key: 'GPU',           value: 'NVIDIA GeForce RTX 4070 12GB GDDR6X' },
      { key: 'RAM',           value: '32GB DDR5-6000 CL30 (2×16GB)' },
      { key: 'Almacenamiento', value: '1TB NVMe PCIe Gen4 + 2TB HDD' },
      { key: 'Refrigeración', value: 'Liquid AIO 360mm ARGB' },
      { key: 'Fuente',        value: '850W 80+ Gold modular' },
      { key: 'Chasis',        value: 'Mid-Tower vidrio templado ARGB' },
      { key: 'S.O.',          value: 'Windows 11 Home 64-bit' },
    ],
  },
];

// ─── Script de seed ───────────────────────────────────────────────────────────
const runSeed = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Define MONGODB_URI en tu archivo .env antes de ejecutar el seed.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB para seed.');

    const shouldDelete = process.argv.includes('--delete');

    if (shouldDelete) {
      await Product.deleteMany({});
      console.log('🗑  Colección de productos limpiada.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Insertar productos (ignorar duplicados de slug si ya existen)
    const inserted = await Product.insertMany(SAMPLE_PRODUCTS, {
      ordered: false, // continuar aunque alguno falle por duplicado
    }).catch((err) => {
      // Error 11000 = duplicate key → ignorar y continuar
      if (err.code === 11000) {
        console.warn('⚠️  Algunos productos ya existen, se omitieron.');
        return err.insertedDocs || [];
      }
      throw err;
    });

    console.log(`\n🚀 Seed completado: ${Array.isArray(inserted) ? inserted.length : '?'} productos insertados.\n`);

    SAMPLE_PRODUCTS.forEach((p) =>
      console.log(`   ✓ [${p.category.padEnd(12)}] ${p.name}`)
    );

    console.log('\n');
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();