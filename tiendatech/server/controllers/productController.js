/**
 * TiendaTech — controllers/productController.js
 * Lógica de negocio para los endpoints de productos.
 *
 * Ubicación: /server/controllers/productController.js
 *
 * Endpoints que controla:
 *   GET  /api/products        → getProducts   (catálogo con filtros, búsqueda, sort, paginación)
 *   GET  /api/products/:id    → getProductById (detalle de un producto)
 */

import mongoose from 'mongoose';
import Product  from '../models/Product.js';

// ─── Helper: construir el filtro de Mongoose desde los query params ───────────
/**
 * Centraliza la lógica de construcción del objeto `filter` para que sea
 * reutilizable y fácil de extender (p.ej.: añadir filtro por marca en el futuro).
 *
 * @param {Object} query - req.query parseado por Express
 * @returns {Object} filtro listo para pasar a Model.find()
 */
const buildFilter = (query) => {
  const filter = { isActive: true }; // Siempre mostrar solo productos activos

  // ── Filtro por categoría ─────────────────────────────────────────────────
  // ?category=Teclados  |  ?category=Monitores
  if (query.category && query.category !== 'Todos') {
    filter.category = query.category;
  }

  // ── Filtro por marca ─────────────────────────────────────────────────────
  // ?brand=Logitech
  if (query.brand) {
    // Case-insensitive con regex para mayor flexibilidad
    filter.brand = { $regex: new RegExp(`^${query.brand}$`, 'i') };
  }

  // ── Búsqueda full-text por nombre / descripción / marca ─────────────────
  // ?search=teclado  →  usa el índice de texto definido en el modelo
  if (query.search && query.search.trim() !== '') {
    filter.$text = { $search: query.search.trim() };
  }

  // ── Filtro de rango de precio ────────────────────────────────────────────
  // ?minPrice=50000&maxPrice=300000
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // ── Solo productos en oferta ─────────────────────────────────────────────
  // ?onSale=true
  if (query.onSale === 'true') {
    filter.isOnSale = true;
  }

  // ── Solo productos destacados ────────────────────────────────────────────
  // ?featured=true
  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  return filter;
};

// ─── Helper: construir el objeto de ordenamiento ──────────────────────────────
/**
 * Traduce el valor del query param ?sort= a la sintaxis de Mongoose.
 *
 * Valores soportados:
 *   price_asc    → precio menor a mayor
 *   price_desc   → precio mayor a menor
 *   newest       → más recientes primero (default)
 *   rating       → mejor valorados primero
 *   name_asc     → alfabético A→Z
 *
 * @param {string|undefined} sortParam
 * @param {boolean} hasTextSearch - si hay búsqueda de texto, añadir score
 * @returns {Object} objeto sort para Mongoose
 */
const buildSort = (sortParam, hasTextSearch = false) => {
  // Si hay búsqueda full-text y no se especificó orden, priorizar relevancia
  if (hasTextSearch && !sortParam) {
    return { score: { $meta: 'textScore' }, createdAt: -1 };
  }

  const sortMap = {
    price_asc:  { price:  1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
    rating:     { rating: -1, reviewCount: -1 },
    name_asc:   { name:   1 },
  };

  return sortMap[sortParam] ?? { createdAt: -1 }; // Default: más recientes
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 1: GET /api/products
//  Obtiene el catálogo con soporte para: filtros, búsqueda, ordenamiento y
//  paginación con cursor (page + limit).
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const {
      page   = 1,
      limit  = 12,
      sort,
      search,
    } = req.query;

    // Validar y sanitizar paginación
    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12)); // máx 50 por página
    const skip     = (pageNum - 1) * limitNum;

    const hasTextSearch = !!search?.trim();
    const filter        = buildFilter(req.query);
    const sortObj       = buildSort(sort, hasTextSearch);

    // ── Proyección base ────────────────────────────────────────────────────
    // En el catálogo no necesitamos todas las specs técnicas (optimiza payload)
    const projection = {
      name:          1,
      slug:          1,
      category:      1,
      brand:         1,
      price:         1,
      originalPrice: 1,
      isOnSale:      1,
      images:        { $slice: 1 }, // Solo la primera imagen en el catálogo
      stock:         1,
      rating:        1,
      reviewCount:   1,
      isFeatured:    1,
      // Si hay búsqueda de texto, incluir el textScore para ordenar por relevancia
      ...(hasTextSearch && { score: { $meta: 'textScore' } }),
    };

    // ── Ejecutar query y count en paralelo ─────────────────────────────────
    const [products, totalCount] = await Promise.all([
      Product
        .find(filter, projection)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(), // .lean() → plain JS objects, más rápido que Mongoose docs completos
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    // ── Respuesta exitosa ──────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          totalCount,
          totalPages,
          currentPage: pageNum,
          limit:       limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        // Reflejar los filtros activos para que el frontend pueda sincronizar su UI
        activeFilters: {
          category:  req.query.category  || null,
          brand:     req.query.brand     || null,
          search:    req.query.search    || null,
          minPrice:  req.query.minPrice  || null,
          maxPrice:  req.query.maxPrice  || null,
          onSale:    req.query.onSale    === 'true',
          featured:  req.query.featured  === 'true',
          sort:      sort                || 'newest',
        },
      },
    });
  } catch (error) {
    console.error('❌ [getProducts]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el catálogo de productos.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 2: GET /api/products/:id
//  Obtiene el detalle completo de un único producto (incluye todas las specs).
//  Acepta tanto ObjectId de MongoDB como el slug SEO-friendly.
// ─────────────────────────────────────────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ── Determinar si es ObjectId o slug ──────────────────────────────────
    // Los ObjectIds de Mongoose tienen exactamente 24 caracteres hexadecimales.
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;

    const filter = isObjectId
      ? { _id: id,   isActive: true }
      : { slug: id,  isActive: true };

    // ── Buscar producto (con specs completas) ─────────────────────────────
    const product = await Product.findOne(filter).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Producto "${id}" no encontrado.`,
      });
    }

    // ── Añadir virtuals manualmente (lean() no los incluye) ───────────────
    const productWithVirtuals = {
      ...product,
      mainImage:       product.images?.[0]             ?? null,
      inStock:         product.stock > 0,
      discountPercent: product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
    };

    // ── Productos relacionados (misma categoría, excluyendo el actual) ────
    const related = await Product
      .find(
        { category: product.category, _id: { $ne: product._id }, isActive: true },
        { name: 1, slug: 1, price: 1, originalPrice: 1, images: { $slice: 1 }, rating: 1, brand: 1 }
      )
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        product: productWithVirtuals,
        related,
      },
    });
  } catch (error) {
    console.error('❌ [getProductById]', error);

    // CastError ocurre si el :id tiene formato inválido para ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'El ID de producto tiene un formato inválido.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 3: GET /api/products/categories
//  Devuelve la lista de categorías disponibles con su conteo de productos.
//  Útil para renderizar los filtros del sidebar dinámicamente.
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = async (_req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id:   '$category',
          count: { $sum: 1 },
          // Guardar la imagen del primer producto de cada categoría como thumbnail
          thumbnail: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      { $sort: { _id: 1 } }, // Orden alfabético
      {
        $project: {
          _id:       0,
          name:      '$_id',
          count:     1,
          thumbnail: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('❌ [getCategories]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías.',
    });
  }
};