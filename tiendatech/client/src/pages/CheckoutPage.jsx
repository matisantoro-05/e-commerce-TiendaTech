/**
 * TiendaTech — pages/CheckoutPage.jsx
 * Actualizado: pre-rellena el formulario con los datos del usuario logueado.
 *
 * Ubicación: /client/src/pages/CheckoutPage.jsx
 */

import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import { useCart }             from '../context/CartContext';
import { useUser }             from '../context/UserContext';
import { ordersApi, paymentApi } from '../lib/api';

const IconArrow  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconLock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLoader = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IconUser   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const validate = (data) => {
  const e = {};
  if (!data.fullName.trim())   e.fullName   = 'Requerido';
  if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Email inválido';
  if (!data.phone.trim())      e.phone      = 'Requerido';
  if (!data.address.trim())    e.address    = 'Requerido';
  if (!data.city.trim())       e.city       = 'Requerido';
  if (!data.province.trim())   e.province   = 'Requerido';
  if (!data.postalCode.trim()) e.postalCode = 'Requerido';
  return e;
};

function Field({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">{label}</label>
      <input className={`input-base ${error ? 'border-red ring-1 ring-red/30' : ''}`} {...props} />
      {error && <span className="text-xs text-red font-body">{error}</span>}
    </div>
  );
}

const PROVINCES = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
];

export default function CheckoutPage({ onOpenAuth }) {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn }            = useUser();

  const shippingCost = totalPrice >= 100000 ? 0 : 5000;
  const total        = totalPrice + shippingCost;

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    address: '', apartment: '',
    city: '', province: '', postalCode: '',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Pre-rellenar con datos del usuario logueado ───────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    setForm({
      fullName:   user.fullName                    || '',
      email:      user.email                       || '',
      phone:      user.phone                       || '',
      address:    user.savedAddress?.address       || '',
      apartment:  user.savedAddress?.apartment     || '',
      city:       user.savedAddress?.city          || '',
      province:   user.savedAddress?.province      || '',
      postalCode: user.savedAddress?.postalCode    || '',
    });
  }, [isLoggedIn, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const orderRes = await ordersApi.create({
        items: cart.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: form,
      });
      const { orderId } = orderRes.data.data;

      const prefRes = await paymentApi.createPreference(orderId);
      const { initPoint, sandboxUrl } = prefRes.data.data;

      clearCart();
      window.location.href = import.meta.env.DEV ? (sandboxUrl || initPoint) : initPoint;
    } catch (err) {
      setApiError(err.message || 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Carrito vacío
  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="font-display font-bold text-3xl text-dark uppercase mb-3">Carrito vacío</h1>
        <p className="text-dark-600 font-body mb-8">Agregá productos antes de ir al checkout.</p>
        <Link to="/" className="btn-dark">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body text-dark-600
                                hover:text-dark transition-colors mb-4">
          <IconArrow /> Volver al catálogo
        </Link>
        <h1 className="font-display font-bold text-4xl text-dark uppercase tracking-wide">Checkout</h1>
      </div>

      {/* Banner usuario no logueado */}
      {!isLoggedIn && (
        <div className="bg-brand-surface border border-brand-muted rounded-2xl px-5 py-4
                        flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm font-body text-dark-600">
              <span className="font-semibold text-dark">¿Tenés cuenta?</span>{' '}
              Iniciá sesión para pre-completar tus datos automáticamente.
            </p>
          </div>
          <button onClick={onOpenAuth}
            className="btn-dark text-sm px-4 py-2 shrink-0 flex items-center gap-1.5">
            <IconUser /> Ingresar
          </button>
        </div>
      )}

      {/* Banner usuario logueado con dirección */}
      {isLoggedIn && user?.savedAddress?.address && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3
                        flex items-center gap-3 mb-6">
          <span className="text-lg">✅</span>
          <p className="text-sm font-body text-green-700">
            Tus datos fueron pre-completados con la información de tu cuenta.
            Podés modificarlos si necesitás enviar a otra dirección.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Formulario ─────────────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            <section className="bg-brand-white border border-brand-muted rounded-2xl p-6">
              <h2 className="section-title text-sm mb-5">Datos de contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Nombre y apellido *" name="fullName"
                    value={form.fullName} onChange={handleChange}
                    placeholder="Juan Pérez" error={errors.fullName} />
                </div>
                <Field label="Email *" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="juan@ejemplo.com" error={errors.email} />
                <Field label="Teléfono *" name="phone" type="tel"
                  value={form.phone} onChange={handleChange}
                  placeholder="11 2345-6789" error={errors.phone} />
              </div>
            </section>

            <section className="bg-brand-white border border-brand-muted rounded-2xl p-6">
              <h2 className="section-title text-sm mb-5">Dirección de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Calle y número *" name="address"
                    value={form.address} onChange={handleChange}
                    placeholder="Av. Corrientes 1234" error={errors.address} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Piso / Depto (opcional)" name="apartment"
                    value={form.apartment} onChange={handleChange} placeholder="3° B" />
                </div>
                <Field label="Ciudad *" name="city"
                  value={form.city} onChange={handleChange}
                  placeholder="Buenos Aires" error={errors.city} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">
                    Provincia *
                  </label>
                  <select name="province" value={form.province} onChange={handleChange}
                    className={`input-base ${errors.province ? 'border-red ring-1 ring-red/30' : ''}`}>
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <span className="text-xs text-red font-body">{errors.province}</span>}
                </div>
                <Field label="Código postal *" name="postalCode"
                  value={form.postalCode} onChange={handleChange}
                  placeholder="1043" error={errors.postalCode} />
              </div>
            </section>

            {apiError && (
              <div className="bg-red-subtle border border-red/20 rounded-xl px-5 py-4">
                <p className="text-red font-body text-sm font-medium">{apiError}</p>
              </div>
            )}
          </div>

          {/* ── Resumen ─────────────────────────────────────────────────── */}
          <aside className="lg:col-span-2">
            <div className="bg-brand-white border border-brand-muted rounded-2xl p-6 sticky top-24">
              <h2 className="section-title text-sm mb-5">Resumen del pedido</h2>

              <ul className="flex flex-col gap-4 mb-6">
                {cart.map(({ product, quantity }) => (
                  <li key={product._id} className="flex gap-3 items-start">
                    <img src={product.images?.[0]} alt={product.name}
                         className="w-14 h-14 object-cover rounded-xl bg-brand-surface shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body font-medium text-dark leading-snug line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-xs text-dark-600 font-body mt-0.5">x{quantity}</p>
                    </div>
                    <span className="font-mono text-sm font-medium text-dark shrink-0">
                      {fmt(product.price * quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-brand-muted pt-4 flex flex-col gap-2 mb-6">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-dark-600">Subtotal</span>
                  <span className="font-medium text-dark">{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-dark-600">Envío</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'text-dark font-medium'}>
                    {shippingCost === 0 ? 'Gratis 🎉' : fmt(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mt-2 pt-3 border-t border-brand-muted">
                  <span className="font-display font-bold text-base text-dark uppercase tracking-wide">Total</span>
                  <span className="font-mono font-medium text-2xl text-dark">{fmt(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full text-base py-4 disabled:opacity-60">
                {loading ? <><IconLoader /> Procesando…</> : <><IconLock /> Pagar con Mercado Pago</>}
              </button>

              <p className="text-center text-[11px] font-body text-brand-subtle mt-3 leading-relaxed">
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}