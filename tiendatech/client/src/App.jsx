/**
 * TiendaTech — App.jsx
 * Router principal. Gestiona el modal de autenticación globalmente.
 *
 * Ubicación: /client/src/App.jsx
 */

import { useState }             from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout público
import Navbar                   from './components/Navbar';
import CartDrawer               from './components/CartDrawer';
import Footer                   from './components/Footer';
import AuthModal                from './components/AuthModal';

// Páginas públicas
import ShopPage                 from './pages/ShopPage';
import ProductDetailPage        from './pages/ProductDetailPage';
import CheckoutPage             from './pages/CheckoutPage';
import ProfilePage              from './pages/ProfilePage';

// Admin
import AdminLoginPage           from './pages/admin/AdminLoginPage';
import AdminLayout              from './pages/admin/AdminLayout';
import DashboardPage            from './pages/admin/DashboardPage';
import ProductsAdminPage        from './pages/admin/ProductsAdminPage';
import ProductFormPage          from './pages/admin/ProductFormPage';

// Páginas de resultado de pago
function PaymentSuccess() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="font-display font-bold text-4xl text-dark uppercase tracking-wide mb-3">¡Pago exitoso!</h1>
      <p className="text-dark-600 font-body mb-8">Tu pedido fue confirmado. Te enviaremos un email con el seguimiento.</p>
      <a href="/" className="btn-dark">Seguir comprando</a>
    </div>
  );
}
function PaymentFailure() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">❌</div>
      <h1 className="font-display font-bold text-4xl text-dark uppercase tracking-wide mb-3">Pago rechazado</h1>
      <p className="text-dark-600 font-body mb-8">Hubo un problema con tu pago. Podés intentarlo nuevamente.</p>
      <a href="/checkout" className="btn-primary">Intentar de nuevo</a>
    </div>
  );
}
function PaymentPending() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">⏳</div>
      <h1 className="font-display font-bold text-4xl text-dark uppercase tracking-wide mb-3">Pago pendiente</h1>
      <p className="text-dark-600 font-body mb-8">Tu pago está siendo procesado. Te avisaremos cuando se confirme.</p>
      <a href="/" className="btn-dark">Volver al inicio</a>
    </div>
  );
}
function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">😕</div>
      <h1 className="font-display font-bold text-5xl text-dark uppercase tracking-wide mb-3">404</h1>
      <p className="text-dark-600 font-body mb-8">La página que buscás no existe.</p>
      <a href="/" className="btn-dark">Ir al inicio</a>
    </div>
  );
}

// Layout público con Navbar, Footer y AuthModal global
function PublicLayout() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <CartDrawer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <div className="flex-1">
        <Routes>
          <Route path="/"             element={<ShopPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/checkout"     element={<CheckoutPage onOpenAuth={() => setAuthOpen(true)} />} />
          <Route path="/perfil"       element={<ProfilePage />} />
          <Route path="/checkout/success" element={<PaymentSuccess />} />
          <Route path="/checkout/failure" element={<PaymentFailure />} />
          <Route path="/checkout/pending" element={<PaymentPending />} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Panel admin — login en /admin, panel en /admin/* */}
      <Route path="/adminlog"         element={<AdminLoginPage />} />
      <Route path="/admin"       element={<AdminLayout />}>
        <Route path="dashboard"         element={<DashboardPage />} />
        <Route path="products"          element={<ProductsAdminPage />} />
        <Route path="products/new"      element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Tienda pública */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}