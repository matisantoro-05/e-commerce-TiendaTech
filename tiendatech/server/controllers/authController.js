/**
 * TiendaTech — controllers/authController.js
 *
 * Ubicación: /server/controllers/authController.js
 *
 * Endpoints:
 *   POST /api/auth/register       → crear cuenta
 *   POST /api/auth/login          → login email + contraseña
 *   POST /api/auth/google         → login / registro con Google
 *   GET  /api/auth/profile        → obtener perfil (requiere JWT)
 *   PUT  /api/auth/profile        → actualizar perfil (requiere JWT)
 *   GET  /api/auth/cart           → obtener carrito en DB (requiere JWT)
 *   PUT  /api/auth/cart           → guardar/sincronizar carrito en DB (requiere JWT)
 *   GET  /api/auth/orders         → historial de órdenes (requiere JWT)
 */

import bcrypt          from 'bcryptjs';
import jwt             from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User  from '../models/User.js';
import Order from '../models/Order.js';

// ─── Helper: generar JWT ──────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// ─── Helper: respuesta con usuario + token ────────────────────────────────────
const userResponse = (user, token) => ({
  token,
  user: {
    _id:          user._id,
    fullName:     user.fullName,
    email:        user.email,
    phone:        user.phone,
    avatar:       user.avatar,
    savedAddress: user.savedAddress,
    hasAddress:   !!(user.savedAddress?.address && user.savedAddress?.city),
    cart:         user.cart || [],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTRO — POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validaciones
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Email ya registrado
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta con ese email.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email:    email.toLowerCase().trim(),
      phone:    phone?.trim() || '',
      password: hashedPassword,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: '¡Cuenta creada exitosamente!',
      data:    userResponse(user, token),
    });
  } catch (error) {
    console.error('❌ [register]', error);
    res.status(500).json({ success: false, message: 'Error al crear la cuenta.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN — POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios.' });
    }

    // Buscar usuario e incluir el password (select: false por defecto)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos.' });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Esta cuenta fue creada con Google. Usá "Ingresar con Google".',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tu cuenta está desactivada.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: `¡Bienvenido de vuelta, ${user.fullName.split(' ')[0]}!`,
      data:    userResponse(user, token),
    });
  } catch (error) {
    console.error('❌ [login]', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE OAUTH — POST /api/auth/google
//  Recibe el credential token de Google, lo verifica, y loguea o registra.
// ─────────────────────────────────────────────────────────────────────────────
export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Token de Google no proporcionado.' });
    }

    // Verificar el token con Google
    const client  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket  = await client.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    // Buscar usuario existente por googleId o email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Actualizar googleId y avatar si es la primera vez con Google
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar)   user.avatar   = picture;
      await user.save();
    } else {
      // Crear cuenta nueva (sin contraseña)
      user = await User.create({
        fullName: name,
        email,
        googleId,
        avatar:   picture,
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: `¡Bienvenido, ${user.fullName.split(' ')[0]}!`,
      data:    userResponse(user, token),
    });
  } catch (error) {
    console.error('❌ [loginWithGoogle]', error);
    res.status(500).json({ success: false, message: 'Error al autenticar con Google.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PERFIL — GET /api/auth/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    res.status(200).json({
      success: true,
      data: userResponse(user, null),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el perfil.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ACTUALIZAR PERFIL — PUT /api/auth/profile
//  Permite editar datos personales, dirección y contraseña.
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, savedAddress, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    // Actualizar campos básicos
    if (fullName?.trim()) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (savedAddress)        user.savedAddress = savedAddress;

    // Cambio de contraseña (opcional)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Ingresá tu contraseña actual.' });
      }
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Tu cuenta usa Google. No podés cambiar la contraseña.',
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado.',
      data:    userResponse(user, null),
    });
  } catch (error) {
    console.error('❌ [updateProfile]', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el perfil.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  OBTENER CARRITO — GET /api/auth/cart
// ─────────────────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('cart');
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    res.status(200).json({ success: true, data: { cart: user.cart } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el carrito.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GUARDAR CARRITO — PUT /api/auth/cart
//  El frontend envía el carrito completo. El backend lo reemplaza en DB.
//  Se llama: al hacer login (merge localStorage + DB), y en cada cambio
//  del carrito cuando el usuario está logueado.
// ─────────────────────────────────────────────────────────────────────────────
export const saveCart = async (req, res) => {
  try {
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: 'El carrito debe ser un array.' });
    }

    // Sanitizar: solo guardar los campos del cartItemSchema
    const sanitized = cart.map((item) => ({
      productId: item.productId || item.product?._id,
      name:      item.name      || item.product?.name,
      brand:     item.brand     || item.product?.brand,
      price:     item.price     || item.product?.price,
      image:     item.image     || item.product?.images?.[0],
      stock:     item.stock     || item.product?.stock,
      quantity:  item.quantity,
    })).filter((i) => i.productId && i.quantity > 0);

    await User.findByIdAndUpdate(req.userId, { cart: sanitized });

    res.status(200).json({ success: true, data: { cart: sanitized } });
  } catch (error) {
    console.error('❌ [saveCart]', error);
    res.status(500).json({ success: false, message: 'Error al guardar el carrito.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  HISTORIAL DE ÓRDENES — GET /api/auth/orders
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('orderNumber status total createdAt items shippingAddress payment')
      .lean();

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el historial.' });
  }
};