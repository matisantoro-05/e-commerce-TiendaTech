/**
 * TiendaTech — middleware/auth.js
 * Middlewares de autenticación para admin y usuarios registrados.
 *
 * Ubicación: /server/middleware/auth.js
 *
 * requireAdmin → token estático del .env (panel admin)
 * requireUser  → JWT firmado (usuarios registrados)
 * optionalUser → adjunta el user si hay token, pero no bloquea si no hay
 */

import jwt from 'jsonwebtoken';

// ─── Admin: token estático ────────────────────────────────────────────────────
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado.' });
  }

  const token  = authHeader.split(' ')[1];
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return res.status(500).json({ success: false, message: 'Error de configuración.' });
  }
  if (token !== secret) {
    return res.status(403).json({ success: false, message: 'Token inválido.' });
  }

  next();
};

// ─── Usuario: JWT ─────────────────────────────────────────────────────────────
export const requireUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Iniciá sesión para continuar.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Sesión expirada. Iniciá sesión nuevamente.' });
  }
};

// ─── Usuario opcional: no bloquea, pero adjunta userId si hay token válido ────
// Usado en createOrder para asociar la orden al usuario si está logueado.
export const optionalUser = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];

  // Si el token es el de admin, no es un usuario
  if (token === process.env.ADMIN_SECRET) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
  } catch {
    // Token inválido/expirado → seguimos sin usuario
  }
  next();
};