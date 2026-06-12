/**
 * TiendaTech — controllers/adminController.js
 * CRUD de productos + estadísticas del dashboard para el panel admin.
 *
 * Ubicación: /server/controllers/adminController.js
 *
 * Endpoints:
 *   POST   /api/admin/login                  → login (verifica secret)
 *   GET    /api/admin/dashboard              → métricas generales
 *   GET    /api/admin/products               → todos los productos (admin view)
 *   POST   /api/admin/products               → crear producto
 *   PUT    /api/admin/products/:id           → editar producto
 *   DELETE /api/admin/products/:id           → eliminar producto (soft delete)
 *   PATCH  /api/admin/products/:id/toggle    → activar/desactivar
 */

import Product from '../models/Product.js';
import Order   from '../models/Order.js';

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN — POST /api/admin/login
//  Solo verifica la contraseña y devuelve el token (que ES la contraseña).
//  El middleware requireAdmin ya protege el resto de rutas.
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogin = (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Contraseña incorrecta.',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      token: process.env.ADMIN_SECRET,
      message: 'Bienvenido al panel de TiendaTech.',
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD — GET /api/admin/dashboard
//  Agrega métricas de ventas, productos y órdenes en un solo endpoint.
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboard = async (_req, res) => {
  try {
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── Ejecutar todas las queries en paralelo ────────────────────────────
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,

      totalOrders,
      paidOrders,
      pendingOrders,

      revenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,

      topProductsAgg,
      revenueByDayAgg,
      ordersByStatusAgg,
      recentOrders,
    ] = await Promise.all([

      // Productos
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),

      // Órdenes
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } }),
      Order.countDocuments({ status: 'pending' }),

      // Ingresos totales
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // Ingresos este mes
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // Ingresos mes pasado
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // Top 5 productos más vendidos
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id:       '$items.productId',
            name:      { $first: '$items.name' },
            brand:     { $first: '$items.brand' },
            image:     { $first: '$items.image' },
            unitsSold: { $sum: '$items.quantity' },
            revenue:   { $sum: '$items.subtotal' },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),

      // Ingresos por día (últimos 30 días)
      Order.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Órdenes por estado
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Últimas 8 órdenes
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber status total createdAt shippingAddress.fullName shippingAddress.email payment.mpStatus')
        .lean(),
    ]);

    // ── Calcular variación mes a mes ──────────────────────────────────────
    const revenueTotal     = revenueAgg[0]?.total         || 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;
    const ordersThisMonth  = revenueThisMonthAgg[0]?.count || 0;
    const ordersLastMonth  = revenueLastMonthAgg[0]?.count || 0;

    const revenueChange = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : null;
    const ordersChange = ordersLastMonth > 0
      ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
      : null;

    res.status(200).json({
      success: true,
      data: {
        // KPIs principales
        kpis: {
          revenueTotal,
          revenueThisMonth,
          revenueChange,
          totalOrders:   paidOrders,
          ordersThisMonth,
          ordersChange,
          totalProducts,
          activeProducts,
          lowStockProducts,
          pendingOrders,
        },
        // Gráfico de ingresos diarios
        revenueByDay: revenueByDayAgg,
        // Top productos
        topProducts: topProductsAgg,
        // Distribución de estados de órdenes
        ordersByStatus: ordersByStatusAgg,
        // Órdenes recientes
        recentOrders,
      },
    });
  } catch (error) {
    console.error('❌ [getDashboard]', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LISTAR PRODUCTOS (admin) — GET /api/admin/products
//  Devuelve TODOS los productos incluyendo inactivos, con datos extra para admin.
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.$text    = { $search: search };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          totalPages: Math.ceil(total / limitNum),
          currentPage: pageNum,
        },
      },
    });
  } catch (error) {
    console.error('❌ [adminGetProducts]', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CREAR PRODUCTO — POST /api/admin/products
// ─────────────────────────────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente.',
      data: { product },
    });
  } catch (error) {
    console.error('❌ [createProduct]', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    res.status(500).json({ success: false, message: 'Error al crear el producto.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  EDITAR PRODUCTO — PUT /api/admin/products/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.status(200).json({
      success: true,
      message: 'Producto actualizado.',
      data: { product },
    });
  } catch (error) {
    console.error('❌ [updateProduct]', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar el producto.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ELIMINAR PRODUCTO — DELETE /api/admin/products/:id
//  Soft delete: isActive = false (conserva historial de órdenes).
//  Pasar ?hard=true para borrado físico permanente.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const hardDelete = req.query.hard === 'true';

    if (hardDelete) {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Producto eliminado permanentemente.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.status(200).json({ success: true, message: 'Producto desactivado.' });
  } catch (error) {
    console.error('❌ [deleteProduct]', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el producto.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE ACTIVO — PATCH /api/admin/products/:id/toggle
// ─────────────────────────────────────────────────────────────────────────────
export const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'No encontrado.' });

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Producto ${product.isActive ? 'activado' : 'desactivado'}.`,
      data: { isActive: product.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado.' });
  }
};