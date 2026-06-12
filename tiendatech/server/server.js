/**
 * TiendaTech — server.js
 * Punto de entrada principal del servidor Express.
 *
 * Ubicación: /server/server.js
 *
 * Rutas registradas:
 *   GET  /api/health                       → Health check
 *   GET  /api/products                     → Catálogo (filtros, búsqueda, paginación)
 *   GET  /api/products/categories          → Categorías con conteo
 *   GET  /api/products/:id                 → Detalle de producto (ObjectId o slug)
 *   POST /api/orders                       → Crear orden de compra
 *   GET  /api/orders/:orderNumber          → Consultar orden por número + email
 *   POST /api/payment/create-preference    → Generar preferencia de Mercado Pago
 *   POST /api/payment/webhook              → Webhook IPN de Mercado Pago
 *   POST /api/admin/login                  → Login del panel admin
 *   GET  /api/admin/dashboard              → Estadísticas y métricas
 *   GET  /api/admin/products               → CRUD de productos (protegido)
 *   POST /api/auth/register                → Crear cuenta de usuario
 *   POST /api/auth/login                   → Login email + contraseña
 *   POST /api/auth/google                  → Login con Google OAuth
 *   GET  /api/auth/profile                 → Perfil del usuario (JWT)
 *   PUT  /api/auth/cart                    → Sincronizar carrito en DB (JWT)
 *   GET  /api/auth/orders                  → Historial de órdenes (JWT)
 */

import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import morgan         from 'morgan';
import 'dotenv/config';

import connectDB      from './config/db.js';
import productRoutes  from './routes/product.routes.js';
import orderRoutes    from './routes/order.routes.js';
import paymentRoutes  from './routes/payment.routes.js';
import adminRoutes    from './routes/admin.routes.js';
import authRoutes     from './routes/auth.routes.js';

// ─── 1. Conectar a MongoDB ────────────────────────────────────────────────────
connectDB();

// ─── 2. Inicializar la app ────────────────────────────────────────────────────
const app = express();

// ─── 3. Middlewares globales ──────────────────────────────────────────────────

/**
 * Seguridad HTTP básica (cabeceras de seguridad).
 * En producción esto es obligatorio.
 */
app.use(helmet());

/**
 * CORS — permitir peticiones desde el frontend (Vite corre en :5173 por defecto).
 * En producción, reemplaza el origin con el dominio real.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

/**
 * Logger de peticiones HTTP.
 * 'dev' → colorizado y conciso para desarrollo.
 * Cambia a 'combined' en producción para logs completos.
 */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * Parseo de JSON y URL-encoded bodies.
 * limit: '10mb' para contemplar payloads con imágenes base64 en el futuro.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── 4. Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'TiendaTech API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 5. Rutas de la API ───────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
//   ↳ GET  /api/products             → catálogo con filtros, búsqueda y paginación
//   ↳ GET  /api/products/categories  → categorías disponibles con conteo
//   ↳ GET  /api/products/:id         → detalle completo por ObjectId o slug

app.use('/api/orders', orderRoutes);
//   ↳ POST /api/orders               → crear orden (valida stock, transacción atómica)
//   ↳ GET  /api/orders/:orderNumber  → consultar orden por número + email

app.use('/api/payment', paymentRoutes);
//   ↳ POST /api/payment/create-preference → genera preferencia MP, devuelve init_point
//   ↳ POST /api/payment/webhook           → recibe notificaciones IPN de MP

app.use('/api/auth',  authRoutes);
//   ↳ POST /api/auth/register|login|google → autenticación pública
//   ↳ GET|PUT /api/auth/profile|cart|orders → rutas protegidas con JWT

app.use('/api/admin', adminRoutes);
//   ↳ POST /api/admin/login                → autenticación del panel
//   ↳ GET  /api/admin/dashboard            → KPIs, gráficos, top productos
//   ↳ GET|POST /api/admin/products         → listar y crear productos
//   ↳ PUT|DELETE|PATCH /api/admin/products/:id → editar, eliminar, toggle

// ─── 6. Manejo de rutas no encontradas (404) ─────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada en TiendaTech API.',
  });
});

// ─── 7. Middleware global de errores ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
    // Solo exponer el stack en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 8. Iniciar servidor ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║   🎮 TiendaTech API — Puerto ${PORT}         ║`);
  console.log(`║   📦 Entorno: ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
  console.log('╚══════════════════════════════════════════╝\n');
});

export default app;