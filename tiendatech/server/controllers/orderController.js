/**
 * TiendaTech — controllers/orderController.js
 * Lógica de negocio para la creación y consulta de órdenes.
 *
 * Ubicación: /server/controllers/orderController.js
 *
 * Endpoints que controla:
 *   POST /api/orders                        → createOrder (optionalUser middleware)
 *   GET  /api/orders/:orderNumber           → getOrderByNumber
 *
 * El middleware optionalUser adjunta req.userId si hay JWT válido,
 * permitiendo asociar la orden al usuario sin requerir login.
 */

import mongoose from 'mongoose';
import Order    from '../models/Order.js';
import Product  from '../models/Product.js';

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 1: POST /api/orders
//  Crea una nueva orden de compra validando stock en tiempo real.
//  El frontend envía { items: [{productId, quantity}], shippingAddress: {...} }
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  // Usamos una sesión de Mongoose para garantizar atomicidad:
  // si algo falla a mitad del proceso (ej: stock insuficiente en ítem 3),
  // se hace rollback de TODO y no se descuenta stock parcialmente.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress } = req.body;

    // ── Validaciones de payload ────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto.',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Los datos de envío son obligatorios.',
      });
    }

    // ── Extraer IDs únicos y buscar todos los productos en UNA sola query ──
    const productIds = [...new Set(items.map((i) => i.productId))];

    const productsFromDB = await Product.find({
      _id:      { $in: productIds },
      isActive: true,
    }).session(session);

    // Convertir a mapa para acceso O(1) por ID
    const productMap = new Map(
      productsFromDB.map((p) => [p._id.toString(), p])
    );

    // ── Construir ítems de la orden validando stock ────────────────────────
    const orderItems   = [];
    const stockUpdates = []; // operaciones de descuento de stock (bulk)
    const errors       = [];

    for (const item of items) {
      const product = productMap.get(item.productId?.toString());

      if (!product) {
        errors.push(`Producto "${item.productId}" no encontrado o inactivo.`);
        continue;
      }

      if (item.quantity < 1) {
        errors.push(`Cantidad inválida para "${product.name}".`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Stock insuficiente para "${product.name}". ` +
          `Disponible: ${product.stock}, solicitado: ${item.quantity}.`
        );
        continue;
      }

      orderItems.push({
        productId: product._id,
        name:      product.name,
        brand:     product.brand,
        image:     product.images[0],
        price:     product.price,        // precio real desde DB (no del cliente)
        quantity:  item.quantity,
        subtotal:  product.price * item.quantity,
      });

      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    // Si hay errores en algún ítem, abortar toda la orden
    if (errors.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Errores al validar los productos.',
        errors,
      });
    }

    // ── Calcular totales del lado del servidor ─────────────────────────────
    // NUNCA confiar en los totales que envía el cliente
    const subtotal    = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const shippingCost = subtotal >= 100000 ? 0 : 5000; // Envío gratis > $100.000
    const total       = subtotal + shippingCost;

    // ── Crear la orden en DB ───────────────────────────────────────────────
    const [newOrder] = await Order.create(
      [{ items: orderItems, shippingAddress, subtotal, shippingCost, total,
         // Asociar al usuario si está logueado (optionalUser lo adjunta)
         userId: req.userId || null }],
      { session }
    );

    // ── Descontar stock de todos los productos (operación bulk) ───────────
    await Product.bulkWrite(stockUpdates, { session });

    // ── Confirmar transacción ──────────────────────────────────────────────
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Orden creada correctamente.',
      data: {
        orderId:     newOrder._id,
        orderNumber: newOrder.orderNumber,
        total:       newOrder.total,
        status:      newOrder.status,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ [createOrder]', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la orden.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLADOR 2: GET /api/orders/:orderNumber
//  Permite al usuario consultar su orden (sin autenticación, por número + email).
//  El email actúa como "contraseña" de la orden para no exponer datos ajenos.
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber }  = req.params;
    const { email }        = req.query; // ?email=usuario@ejemplo.com

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el email para consultar la orden.',
      });
    }

    const order = await Order.findOne({
      orderNumber,
      'shippingAddress.email': email.toLowerCase().trim(),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada. Verificá el número y el email.',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('❌ [getOrderByNumber]', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar la orden.',
    });
  }
};