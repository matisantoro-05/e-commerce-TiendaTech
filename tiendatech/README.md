# 🎮 TiendaTech — E-Commerce de Hardware Gamer

<div align="center">

![TiendaTech Banner](https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&q=80)

**E-Commerce profesional full-stack dedicado a la venta de periféricos y componentes de hardware gamer.**
Teclados mecánicos, mouses, monitores, auriculares y PCs de alto rendimiento.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## 📋 Tabla de Contenidos

- [Demo](#-demo)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura-del-proyecto)
- [Instalación](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [API Reference](#-api-reference)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Autor](#-autor)

---

## 🚀 Demo

> Próximamente disponible en producción.

---

## ✨ Características

### 🛍️ Tienda

- **Catálogo dinámico** con grilla responsiva de productos
- **Filtros en tiempo real** por categoría (Teclados, Mouses, Monitores, Auriculares, PCs, Sillas, Accesorios)
- **Búsqueda full-text** indexada en MongoDB (nombre, descripción, marca)
- **Ordenamiento** por precio, fecha, rating y nombre
- **Paginación** del lado del servidor
- **Filtros persistentes en la URL** — compartibles y compatibles con el botón "atrás"

### 📦 Producto

- Página de detalle con **galería de imágenes** y miniaturas
- **Especificaciones técnicas** en tabla dinámica por categoría
- **Selector de cantidad** con validación de stock en tiempo real
- **Productos relacionados** de la misma categoría
- Indicador de stock (normal / bajo / sin stock)
- Badges de oferta con porcentaje de descuento calculado

### 🛒 Carrito

- **Carrito global** con `useReducer` + `Context API`
- **Doble persistencia:**
  - Usuario no logueado → `localStorage`
  - Usuario logueado → `localStorage` + **MongoDB** (sync automático con debounce)
- **Fusión automática** del carrito local al iniciar sesión
- Panel lateral animado (slide-in drawer) con microinteracciones
- Sumar, restar, eliminar ítems y vaciar carrito
- Cálculo automático de totales y envío gratis (compras ≥ $100.000)

### 💳 Checkout y Pagos

- Formulario de datos de envío con validación
- **Pre-relleno automático** con la dirección guardada del usuario logueado
- Integración con **Mercado Pago SDK** oficial
- Generación de preferencia de pago en el backend (segura)
- Webhook para confirmación de pagos (IPN)
- Páginas de resultado: éxito, fallo y pendiente

### 👤 Autenticación de Usuarios

- **Registro** con nombre, email, teléfono y contraseña
- **Login** con email y contraseña (bcrypt)
- **Login con Google** OAuth 2.0 (via `@react-oauth/google`)
- Sesión persistida con **JWT** (30 días)
- Modal animado con transición entre login y registro
- Dropdown de perfil en el Navbar con avatar de Google o inicial

### 👤 Perfil de Usuario

- **Pestaña "Mis datos":** editar nombre, teléfono y dirección completa
- **Pestaña "Historial":** órdenes con estado, fecha, total e ítems expandibles
- Dirección guardada se usa automáticamente en el checkout

### 🔧 Panel de Administración

- Login protegido por contraseña (`ADMIN_SECRET`)
- **Dashboard** con métricas en tiempo real:
  - KPIs: ingresos totales, ingresos del mes (con variación %), órdenes pagas, productos activos
  - Gráfico de barras SVG con ingresos de los últimos 30 días
  - Top 5 productos más vendidos (unidades e ingresos)
  - Distribución de órdenes por estado
  - Últimas 8 órdenes recientes
  - Alerta de stock bajo (≤ 5 unidades)
- **Gestión de productos:**
  - Tabla con búsqueda, filtro por categoría y paginación
  - Toggle activo/inactivo directo en la fila
  - Crear producto con formulario completo
  - Editar producto (misma página, detecta el `:id`)
  - Eliminar con modal de confirmación (soft delete)
- **Formulario de producto:**
  - Información básica, marca, categoría
  - Precios con precio original tachado y badge de oferta
  - Stock con alertas de bajo inventario
  - Imágenes (múltiples URLs con preview en vivo)
  - Especificaciones técnicas como pares clave-valor dinámicos
  - Toggles: activo, destacado, en oferta
  - Rating y cantidad de reseñas

---

## 🛠 Tecnologías

### Frontend

| Tecnología              | Versión | Uso                      |
| ----------------------- | ------- | ------------------------ |
| **React**               | 18.3    | UI library               |
| **Vite**                | 5.3     | Build tool y dev server  |
| **Tailwind CSS**        | 3.4     | Estilos utilitarios      |
| **React Router DOM**    | 6.24    | Enrutamiento client-side |
| **Axios**               | 1.7     | Cliente HTTP             |
| **@react-oauth/google** | 0.12    | Google OAuth 2.0         |
| **jwt-decode**          | 4.0     | Decodificación de JWT    |

### Backend

| Tecnología              | Versión | Uso                              |
| ----------------------- | ------- | -------------------------------- |
| **Node.js**             | 22      | Runtime                          |
| **Express**             | 4.19    | Framework HTTP                   |
| **MongoDB Atlas**       | —       | Base de datos NoSQL en la nube   |
| **Mongoose**            | 8.5     | ODM para MongoDB                 |
| **bcryptjs**            | 2.4     | Hash de contraseñas              |
| **jsonwebtoken**        | 9.0     | Autenticación JWT                |
| **google-auth-library** | 9.13    | Verificación de tokens de Google |
| **Mercado Pago SDK**    | 2.3     | Procesamiento de pagos           |
| **Helmet**              | 7.1     | Seguridad HTTP                   |
| **Morgan**              | 1.10    | Logger de requests               |
| **CORS**                | 2.8     | Control de orígenes              |
| **dotenv**              | 16.4    | Variables de entorno             |

---

## 🗂 Arquitectura del Proyecto

```
tiendatech/                         Monorepo
│
├── client/                         Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── main.jsx                Punto de entrada
│   │   ├── App.jsx                 Router principal
│   │   ├── AppRoot.jsx             Bridge entre CartContext y UserContext
│   │   ├── index.css               Estilos globales + utilidades Tailwind
│   │   │
│   │   ├── lib/
│   │   │   └── api.js              Cliente Axios centralizado con interceptores
│   │   │
│   │   ├── context/
│   │   │   ├── CartContext.jsx     Carrito global (reducer + doble persistencia)
│   │   │   ├── UserContext.jsx     Usuario logueado + sync carrito DB
│   │   │   └── AuthContext.jsx     Sesión del panel admin
│   │   │
│   │   ├── hooks/
│   │   │   └── useProducts.js      Fetch de catálogo, detalle y categorías
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx          Navegación + buscador + carrito + perfil
│   │   │   ├── CartDrawer.jsx      Panel lateral del carrito
│   │   │   ├── AuthModal.jsx       Modal login / registro con Google
│   │   │   ├── ProductCard.jsx     Tarjeta de producto con animaciones
│   │   │   ├── CategoryFilter.jsx  Sidebar de filtros y ordenamiento
│   │   │   └── Footer.jsx
│   │   │
│   │   └── pages/
│   │       ├── ShopPage.jsx        Catálogo con filtros + paginación
│   │       ├── ProductDetailPage.jsx  Detalle completo + relacionados
│   │       ├── CheckoutPage.jsx    Formulario + Mercado Pago
│   │       ├── ProfilePage.jsx     Perfil + dirección + historial
│   │       └── admin/
│   │           ├── AdminLoginPage.jsx
│   │           ├── AdminLayout.jsx    Sidebar + rutas protegidas
│   │           ├── DashboardPage.jsx  Métricas y gráficos
│   │           ├── ProductsAdminPage.jsx  Tabla CRUD
│   │           └── ProductFormPage.jsx    Formulario crear/editar
│   │
│   ├── tailwind.config.js          Paleta personalizada (rojo, negro, blanco)
│   ├── vite.config.js              Proxy /api → localhost:5000
│   └── .env.example
│
└── server/                         Backend (Node.js + Express + MongoDB)
    ├── server.js                   Punto de entrada Express
    ├── config/
    │   └── db.js                   Conexión MongoDB con reconexión automática
    ├── middleware/
    │   └── auth.js                 requireAdmin / requireUser / optionalUser
    ├── models/
    │   ├── Product.js              Esquema con virtuals, slug auto, índice full-text
    │   ├── Order.js                Esquema con snapshots, transacciones atómicas
    │   └── User.js                 Esquema con carrito embebido y dirección
    ├── controllers/
    │   ├── productController.js    Catálogo con filtros, búsqueda, paginación
    │   ├── orderController.js      Creación con transacción + descuento de stock
    │   ├── paymentController.js    Preferencia MP + webhook IPN
    │   ├── authController.js       Registro, login, Google OAuth, perfil, carrito
    │   └── adminController.js      CRUD productos + estadísticas del dashboard
    ├── routes/
    │   ├── product.routes.js
    │   ├── order.routes.js
    │   ├── payment.routes.js
    │   ├── auth.routes.js
    │   └── admin.routes.js
    └── seed/
        └── products.seed.js        5 productos de muestra
```

---

## ⚙️ Instalación y Configuración

### Prerequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta en **MongoDB Atlas** (gratuita)
- Cuenta en **Mercado Pago Developers** (gratuita)
- Proyecto en **Google Cloud Console** con OAuth 2.0 habilitado

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tiendatech.git
cd tiendatech
```

### 2. Configurar el Backend

```bash
cd server
npm install
cp .env.example .env
```

Completar el archivo `.env` (ver sección siguiente).

```bash
# Poblar la base de datos con productos de muestra
npm run seed

# Iniciar el servidor de desarrollo
npm run dev
# → API disponible en http://localhost:5000
# → Health check: http://localhost:5000/api/health
```

### 3. Configurar el Frontend

```bash
cd ../client
npm install
cp .env.example .env
```

Completar `VITE_GOOGLE_CLIENT_ID` en el `.env`.

```bash
npm run dev
# → App disponible en http://localhost:5173
```

---

## 🔐 Variables de Entorno

### `server/.env`

```env
# Servidor
NODE_ENV=development
PORT=5000

# MongoDB Atlas
# Formato: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/tiendatech

# CORS
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Mercado Pago
# Obtener en: https://www.mercadopago.com.ar/developers
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Panel de Administración
ADMIN_SECRET=tu_contraseña_admin_segura

# JWT (usuarios registrados)
JWT_SECRET=string_largo_y_aleatorio_muy_secreto
JWT_EXPIRES_IN=30d

# Google OAuth
# Obtener en: https://console.cloud.google.com
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

### `client/.env`

```env
# URL de la API (vacío en desarrollo — Vite proxy lo maneja)
VITE_API_URL=

# Google OAuth (mismo Client ID que el backend)
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 📡 API Reference

### Productos

| Método | Endpoint                   | Descripción                                 |
| ------ | -------------------------- | ------------------------------------------- |
| `GET`  | `/api/products`            | Catálogo con filtros, búsqueda y paginación |
| `GET`  | `/api/products/categories` | Categorías con conteo de productos          |
| `GET`  | `/api/products/:id`        | Detalle de producto (ObjectId o slug)       |

**Query params de `/api/products`:**

```
?category=Teclados    Filtrar por categoría
?search=mechanical    Búsqueda full-text
?sort=price_asc       newest | price_asc | price_desc | rating | name_asc
?onSale=true          Solo ofertas
?featured=true        Solo destacados
?minPrice=50000       Rango de precio
?maxPrice=300000
?page=1&limit=12      Paginación
```

### Órdenes

| Método | Endpoint                   | Descripción                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| `POST` | `/api/orders`              | Crear orden (valida stock, transacción atómica) |
| `GET`  | `/api/orders/:orderNumber` | Consultar orden por número + email              |

### Pagos

| Método | Endpoint                         | Descripción                         |
| ------ | -------------------------------- | ----------------------------------- |
| `POST` | `/api/payment/create-preference` | Generar preferencia de Mercado Pago |
| `POST` | `/api/payment/webhook`           | Webhook IPN de Mercado Pago         |

### Autenticación de Usuarios

| Método | Endpoint             | Auth | Descripción                   |
| ------ | -------------------- | ---- | ----------------------------- |
| `POST` | `/api/auth/register` | —    | Crear cuenta                  |
| `POST` | `/api/auth/login`    | —    | Login con email y contraseña  |
| `POST` | `/api/auth/google`   | —    | Login con Google OAuth        |
| `GET`  | `/api/auth/profile`  | JWT  | Obtener perfil                |
| `PUT`  | `/api/auth/profile`  | JWT  | Actualizar perfil y dirección |
| `GET`  | `/api/auth/cart`     | JWT  | Obtener carrito desde DB      |
| `PUT`  | `/api/auth/cart`     | JWT  | Guardar carrito en DB         |
| `GET`  | `/api/auth/orders`   | JWT  | Historial de órdenes          |

### Panel Admin _(requiere `ADMIN_SECRET`)_

| Método   | Endpoint                         | Descripción                       |
| -------- | -------------------------------- | --------------------------------- |
| `POST`   | `/api/admin/login`               | Login del panel admin             |
| `GET`    | `/api/admin/dashboard`           | KPIs, gráficos y estadísticas     |
| `GET`    | `/api/admin/products`            | Listar todos los productos        |
| `POST`   | `/api/admin/products`            | Crear producto                    |
| `PUT`    | `/api/admin/products/:id`        | Editar producto                   |
| `DELETE` | `/api/admin/products/:id`        | Desactivar producto (soft delete) |
| `PATCH`  | `/api/admin/products/:id/toggle` | Activar / desactivar              |

---

## 🎨 Sistema de Diseño

**Paleta de colores TiendaTech:**

| Token           | Color     | Uso                                      |
| --------------- | --------- | ---------------------------------------- |
| `red`           | `#E3000F` | CTAs, badges de oferta, acento principal |
| `dark`          | `#0A0A0A` | Navbar, footer, botones secundarios      |
| `brand-white`   | `#FFFFFF` | Fondo principal                          |
| `brand-surface` | `#F7F7F8` | Fondo de tarjetas                        |
| `brand-muted`   | `#EBEBEC` | Bordes y separadores                     |

**Tipografías:**

- `Barlow Condensed` — títulos y display (estética industrial/gamer)
- `DM Sans` — texto de cuerpo (legible y moderno)
- `JetBrains Mono` — precios y especificaciones técnicas

**Animaciones custom:** `fade-up`, `slide-in-right`, `pop` (badge carrito), `shimmer` (skeleton loaders)

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (12 salt rounds)
- Tokens JWT con expiración configurable
- Middleware `helmet` para headers HTTP seguros
- CORS configurado para orígenes específicos
- Totales de órdenes calculados siempre del lado del **servidor** (nunca se confía en el cliente)
- Transacciones atómicas de MongoDB para operaciones de stock
- Soft delete en productos (preserva historial de órdenes)
- Variables de entorno separadas para desarrollo y producción
- Admin y usuarios con sistemas de auth completamente independientes

---

## 📜 Scripts disponibles

### Backend (`/server`)

```bash
npm run dev       # Servidor con nodemon (recarga automática)
npm start         # Servidor en producción
npm run seed      # Insertar 5 productos de muestra
npm run seed:clean  # Limpiar colección de productos
```

### Frontend (`/client`)

```bash
npm run dev       # Dev server en http://localhost:5173
npm run build     # Build de producción en /dist
npm run preview   # Preview del build de producción
```

---

## 🚀 Deploy

### Backend — Railway / Render

1. Conectar el repositorio
2. Configurar las variables de entorno del `server/.env`
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend — Vercel

1. Conectar el repositorio, seleccionar la carpeta `client/`
2. Framework: **Vite**
3. Configurar `VITE_API_URL=https://tu-backend.railway.app/api`
4. Configurar `VITE_GOOGLE_CLIENT_ID`

---

## 👤 Autor

**Tu Nombre**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [linkedin.com/in/tu-perfil](https://linkedin.com/in/tu-perfil)
- Portfolio: [tu-portfolio.com](https://tu-portfolio.com)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

<div align="center">
  <p>Hecho con ❤️ usando React, Node.js y MongoDB</p>
  <p>
    <a href="#-tiendatech--e-commerce-de-hardware-gamer">⬆ Volver arriba</a>
  </p>
</div>
