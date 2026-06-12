/**
 * TiendaTech — pages/ProfilePage.jsx
 * Perfil del usuario logueado: datos personales + dirección + historial.
 *
 * Ubicación: /client/src/pages/ProfilePage.jsx
 * Ruta: /perfil
 */

import { useState, useEffect } from 'react';
import { Navigate }            from 'react-router-dom';
import { useUser }             from '../context/UserContext';
import { authApi }             from '../lib/api';

const IconUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconHistory = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.31"/></svg>;
const IconSave    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconEdit    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0);

const STATUS_LABELS = {
  pending:    { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700' },
  paid:       { label: 'Pagado',      color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En proceso',  color: 'bg-purple-100 text-purple-700' },
  shipped:    { label: 'Enviado',     color: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelado',   color: 'bg-brand-muted text-dark-600' },
  failed:     { label: 'Fallido',     color: 'bg-red-subtle text-red' },
};

const PROVINCES = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
];

// ── Campo de formulario ───────────────────────────────────────────────────────
function Field({ label, error, disabled, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red font-body">{error}</p>}
    </div>
  );
}

// ── Pestaña: Mis datos ────────────────────────────────────────────────────────
function TabDatos({ user, onUpdate }) {
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [errors,   setErrors]   = useState({});

  const [form, setForm] = useState({
    fullName:    user?.fullName    || '',
    phone:       user?.phone       || '',
    address:     user?.savedAddress?.address    || '',
    apartment:   user?.savedAddress?.apartment  || '',
    city:        user?.savedAddress?.city       || '',
    province:    user?.savedAddress?.province   || '',
    postalCode:  user?.savedAddress?.postalCode || '',
  });

  // Sincronizar si cambia el user desde el context
  useEffect(() => {
    setForm({
      fullName:   user?.fullName    || '',
      phone:      user?.phone       || '',
      address:    user?.savedAddress?.address    || '',
      apartment:  user?.savedAddress?.apartment  || '',
      city:       user?.savedAddress?.city       || '',
      province:   user?.savedAddress?.province   || '',
      postalCode: user?.savedAddress?.postalCode || '',
    });
  }, [user]);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSave = async () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'El nombre es obligatorio.';
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setSuccess('');
    const result = await onUpdate({
      fullName: form.fullName,
      phone:    form.phone,
      savedAddress: {
        address:    form.address,
        apartment:  form.apartment,
        city:       form.city,
        province:   form.province,
        postalCode: form.postalCode,
      },
    });
    setLoading(false);
    if (result.success) {
      setSuccess('Datos guardados correctamente.');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const inputClass = (field) =>
    `input-base ${!editing ? 'bg-brand-surface cursor-not-allowed opacity-70' : ''} ${errors[field] ? 'border-red' : ''}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-4 p-5 bg-brand-surface rounded-2xl border border-brand-muted">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.fullName}
               className="w-16 h-16 rounded-full object-cover border-2 border-brand-muted" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-white text-2xl">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-display font-bold text-xl text-dark uppercase tracking-wide">
            {user?.fullName}
          </p>
          <p className="text-sm text-dark-600 font-body">{user?.email}</p>
          {user?.avatar && (
            <span className="text-xs bg-brand-muted text-dark-600 font-body px-2 py-0.5 rounded-md mt-1 inline-block">
              Cuenta Google
            </span>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-700 font-body text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Datos personales */}
      <section className="bg-brand-white border border-brand-muted rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Datos personales
          </h3>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="btn-ghost text-sm flex items-center gap-1.5">
              <IconEdit /> Editar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre y apellido *" error={errors.fullName}>
            <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
                   disabled={!editing} className={inputClass('fullName')} />
          </Field>
          <Field label="Email">
            <input value={user?.email || ''} disabled
                   className="input-base bg-brand-surface cursor-not-allowed opacity-70" />
          </Field>
          <Field label="Teléfono (opcional)">
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                   disabled={!editing} placeholder="11 2345-6789"
                   className={inputClass('phone')} />
          </Field>
        </div>
      </section>

      {/* Dirección guardada */}
      <section className="bg-brand-white border border-brand-muted rounded-2xl p-6">
        <h3 className="font-display font-bold text-sm text-dark uppercase tracking-widest mb-1">
          Dirección de envío
        </h3>
        <p className="text-xs text-dark-600 font-body mb-5">
          Se usará para pre-completar el formulario de checkout automáticamente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Calle y número">
              <input value={form.address} onChange={(e) => set('address', e.target.value)}
                     disabled={!editing} placeholder="Av. Corrientes 1234"
                     className={inputClass('address')} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Piso / Depto (opcional)">
              <input value={form.apartment} onChange={(e) => set('apartment', e.target.value)}
                     disabled={!editing} placeholder="3° B"
                     className={inputClass('apartment')} />
            </Field>
          </div>
          <Field label="Ciudad">
            <input value={form.city} onChange={(e) => set('city', e.target.value)}
                   disabled={!editing} placeholder="Buenos Aires"
                   className={inputClass('city')} />
          </Field>
          <Field label="Provincia">
            <select value={form.province} onChange={(e) => set('province', e.target.value)}
                    disabled={!editing} className={inputClass('province')}>
              <option value="">Seleccioná</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Código postal">
            <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)}
                   disabled={!editing} placeholder="1043"
                   className={inputClass('postalCode')} />
          </Field>
        </div>
      </section>

      {/* Botones */}
      {editing && (
        <div className="flex gap-3">
          <button onClick={() => { setEditing(false); setErrors({}); }}
            className="btn-outline flex-1">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50">
            {loading ? 'Guardando…' : <><IconSave /> Guardar cambios</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Pestaña: Historial ────────────────────────────────────────────────────────
function TabHistorial() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    authApi.getOrders()
      .then((res) => setOrders(res.data.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">📦</p>
      <p className="font-display font-bold text-2xl text-dark uppercase tracking-wide mb-2">
        Sin compras aún
      </p>
      <p className="text-dark-600 font-body text-sm">
        Cuando realices una compra, aparecerá acá.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const cfg    = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-brand-surface text-dark' };
        const isOpen = expanded === order._id;
        const date   = new Date(order.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit', month: 'long', year: 'numeric',
        });

        return (
          <div key={order._id}
            className="bg-brand-white border border-brand-muted rounded-2xl overflow-hidden
                       transition-all duration-300">
            {/* Cabecera de la orden */}
            <button
              onClick={() => setExpanded(isOpen ? null : order._id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4
                         hover:bg-brand-surface transition-colors duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-left min-w-0">
                  <p className="font-mono font-semibold text-sm text-dark">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-dark-600 font-body mt-0.5">{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-lg ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="font-mono font-semibold text-dark text-sm">
                  {fmt(order.total)}
                </span>
                <span className={`text-dark-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </button>

            {/* Detalle expandido */}
            {isOpen && (
              <div className="border-t border-brand-muted px-5 py-4 animate-fade-up
                              [animation-fill-mode:forwards]">
                <ul className="flex flex-col divide-y divide-brand-muted">
                  {order.items?.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <img src={item.image} alt={item.name}
                           className="w-12 h-12 rounded-xl object-cover bg-brand-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium text-dark truncate">{item.name}</p>
                        <p className="text-xs text-dark-600 font-body">{item.brand} · x{item.quantity}</p>
                      </div>
                      <span className="font-mono text-sm font-medium text-dark shrink-0">
                        {fmt(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mt-4 pt-3
                                border-t border-brand-muted text-sm font-body">
                  <span className="text-dark-600">
                    Envío a {order.shippingAddress?.city}, {order.shippingAddress?.province}
                  </span>
                  <span className="font-mono font-bold text-dark">{fmt(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ProfilePage({ onOpenAuth }) {
  const { user, isLoggedIn, updateProfile } = useUser();
  const [tab, setTab] = useState('datos');

  // Si no está logueado, redirigir a inicio
  if (!isLoggedIn) return <Navigate to="/" replace />;

  const tabs = [
    { id: 'datos',    label: 'Mis datos',   icon: <IconUser /> },
    { id: 'historial',label: 'Historial',   icon: <IconHistory /> },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-dark uppercase tracking-wide">
          Mi cuenta
        </h1>
        <p className="text-dark-600 font-body text-sm mt-1">
          Gestioná tu perfil, dirección e historial de compras.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-brand-surface p-1 rounded-2xl border border-brand-muted mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                        rounded-xl text-sm font-body font-medium transition-all duration-200
                        ${tab === t.id
                          ? 'bg-brand-white text-dark shadow-card border border-brand-muted'
                          : 'text-dark-600 hover:text-dark'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'datos'     && <TabDatos    user={user} onUpdate={updateProfile} />}
      {tab === 'historial' && <TabHistorial />}
    </main>
  );
}