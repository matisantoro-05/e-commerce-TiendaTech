/**
 * TiendaTech — routes/product.routes.js
 * Define y expone los endpoints públicos del catálogo de productos.
 *
 * Ubicación: /server/routes/product.routes.js
 *
 * Endpoints registrados (todos prefijados con /api/products en server.js):
 *
 *   GET  /api/products                → Catálogo completo (filtros + búsqueda + paginación)
 *   GET  /api/products/categories     → Lista de categorías con conteo
 *   GET  /api/products/:id            → Detalle de un producto (por ObjectId o slug)
 *
 * NOTA: La ruta /categories DEBE registrarse ANTES de /:id para que Express
 * no interprete la palabra "categories" como un parámetro :id.
 */

import { Router }         from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
} from '../controllers/productController.js';

const router = Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
/**
 * Catálogo de productos con soporte para:
 *
 * Query params disponibles:
 * ┌─────────────┬──────────────────────────────────────────────────────────────┐
 * │  Param      │  Descripción / Ejemplo                                       │
 * ├─────────────┼──────────────────────────────────────────────────────────────┤
 * │  category   │  Filtrar por categoría exacta  → ?category=Teclados          │
 * │  brand      │  Filtrar por marca             → ?brand=Logitech             │
 * │  search     │  Búsqueda full-text            → ?search=teclado mecánico    │
 * │  minPrice   │  Precio mínimo                 → ?minPrice=50000             │
 * │  maxPrice   │  Precio máximo                 → ?maxPrice=300000            │
 * │  onSale     │  Solo ofertas                  → ?onSale=true                │
 * │  featured   │  Solo destacados               → ?featured=true              │
 * │  sort       │  Ordenamiento:                                               │
 * │             │    newest (default) | price_asc | price_desc                 │
 * │             │    rating | name_asc           → ?sort=price_asc             │
 * │  page       │  Página actual (default: 1)    → ?page=2                     │
 * │  limit      │  Resultados por página (1-50)  → ?limit=8                    │
 * └─────────────┴──────────────────────────────────────────────────────────────┘
 *
 * Ejemplos de uso:
 *   GET /api/products
 *   GET /api/products?category=Monitores&sort=price_asc
 *   GET /api/products?search=mouse inalambrico&page=1&limit=6
 *   GET /api/products?onSale=true&maxPrice=200000
 */
router.get('/', getProducts);

// ─── GET /api/products/categories ────────────────────────────────────────────
/**
 * Devuelve las categorías disponibles con su conteo de productos.
 * Ideal para construir el panel de filtros del frontend dinámicamente.
 *
 * Respuesta de ejemplo:
 * {
 *   "success": true,
 *   "data": {
 *     "categories": [
 *       { "name": "Auriculares", "count": 3, "thumbnail": "https://..." },
 *       { "name": "Monitores",   "count": 5, "thumbnail": "https://..." },
 *       ...
 *     ]
 *   }
 * }
 *
 * IMPORTANTE: Debe estar definida ANTES de /:id
 */
router.get('/categories', getCategories);

// ─── GET /api/products/:id ────────────────────────────────────────────────────
/**
 * Detalle completo de un producto individual.
 * Acepta tanto MongoDB ObjectId como slug SEO-friendly:
 *
 *   GET /api/products/6698f4a3b5c2d10012e4ab1c     (por ObjectId)
 *   GET /api/products/keychron-q3-pro-tkl-wireless-a1b2c3  (por slug)
 *
 * Incluye en la respuesta:
 *   - Todos los campos del producto (con virtuals: inStock, discountPercent, mainImage)
 *   - Array `related` con hasta 4 productos de la misma categoría
 */
router.get('/:id', getProductById);

export default router;