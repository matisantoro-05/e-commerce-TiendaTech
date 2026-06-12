/**
 * TiendaTech — components/AuthModal.jsx
 * Modal de autenticación con vistas: Login / Registro.
 * Incluye login con Google OAuth.
 *
 * Ubicación: /client/src/components/AuthModal.jsx
 */

import { useState, useEffect } from 'react';
import { GoogleLogin }         from '@react-oauth/google';
import { useUser }             from '../context/UserContext';
import { useCart }             from '../context/CartContext';

const IconX    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconEye  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

function InputField({ label, error, type = 'text', showToggle, ...props }) {
  const [show, setShow] = useState(false);
  const actualType = showToggle ? (show ? 'text' : 'password') : type;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={actualType}
          className={`input-base pr-${showToggle ? '10' : '4'} ${error ? 'border-red ring-1 ring-red/30' : ''}`}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle
                       hover:text-dark transition-colors"
          >
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red font-body">{error}</p>}
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }) {
  const { login, loginWithGoogle, register, loading, error } = useUser();
  const { cart } = useCart();

  const [view,   setView]   = useState('login'); // 'login' | 'register'
  const [errors, setErrors] = useState({});
  const [form,   setForm]   = useState({
    fullName: '', email: '', phone: '',
    password: '', confirmPassword: '',
  });

  // Limpiar estado al abrir
  useEffect(() => {
    if (isOpen) {
      setView('login');
      setErrors({});
      setForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validateLogin = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido.';
    if (!form.password) e.password = 'Ingresá tu contraseña.';
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'El nombre es obligatorio.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido.';
    if (!form.password || form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.';
    return e;
  };

  // ── Submit login ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await login(form.email, form.password, cart);
    if (result.success) onClose();
  };

  // ── Submit registro ───────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await register({
      fullName:        form.fullName,
      email:           form.email,
      phone:           form.phone,
      password:        form.password,
      confirmPassword: form.confirmPassword,
    }, cart);
    if (result.success) onClose();
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential, cart);
    if (result.success) onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-brand-white rounded-2xl shadow-card-hover border border-brand-muted
                     w-full max-w-md animate-fade-up [animation-fill-mode:forwards]
                     max-h-[90vh] overflow-y-auto scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-brand-muted">
            <div>
              <h2 className="font-display font-bold text-2xl text-dark uppercase tracking-wide">
                {view === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h2>
              <p className="text-xs text-dark-600 font-body mt-0.5">
                {view === 'login'
                  ? 'Accedé a tu cuenta de TiendaTech'
                  : 'Registrate gratis en TiendaTech'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-dark-600 hover:text-dark hover:bg-brand-surface
                         transition-all duration-200"
            >
              <IconX />
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Error global de la API */}
            {error && (
              <div className="bg-red-subtle border border-red/20 rounded-xl px-4 py-3">
                <p className="text-red text-sm font-body">{error}</p>
              </div>
            )}

            {/* Google OAuth */}
            <div className="flex flex-col items-center">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => {}}
                text={view === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                width="360"
                locale="es"
              />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-brand-muted" />
              <span className="text-xs font-body text-brand-subtle uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-brand-muted" />
            </div>

            {/* ── FORMULARIO LOGIN ─────────────────────────────────────── */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <InputField
                  label="Email *"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  error={errors.email}
                  autoComplete="email"
                />
                <InputField
                  label="Contraseña *"
                  showToggle
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-1 disabled:opacity-50"
                >
                  {loading ? 'Ingresando…' : 'Iniciar sesión'}
                </button>
              </form>
            )}

            {/* ── FORMULARIO REGISTRO ──────────────────────────────────── */}
            {view === 'register' && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <InputField
                  label="Nombre y apellido *"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Juan Pérez"
                  error={errors.fullName}
                  autoComplete="name"
                />
                <InputField
                  label="Email *"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  error={errors.email}
                  autoComplete="email"
                />
                <InputField
                  label="Teléfono (opcional)"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="11 2345-6789"
                  autoComplete="tel"
                />
                <InputField
                  label="Contraseña * (mín. 6 caracteres)"
                  showToggle
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  autoComplete="new-password"
                />
                <InputField
                  label="Confirmar contraseña *"
                  showToggle
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-1 disabled:opacity-50"
                >
                  {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
                </button>
              </form>
            )}

            {/* Toggle login / registro */}
            <p className="text-center text-sm font-body text-dark-600">
              {view === 'login' ? (
                <>
                  ¿No tenés cuenta?{' '}
                  <button
                    onClick={() => { setView('register'); setErrors({}); }}
                    className="text-red font-semibold hover:text-red-hover transition-colors"
                  >
                    Registrate gratis
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tenés cuenta?{' '}
                  <button
                    onClick={() => { setView('login'); setErrors({}); }}
                    className="text-red font-semibold hover:text-red-hover transition-colors"
                  >
                    Iniciá sesión
                  </button>
                </>
              )}
            </p>

            <p className="text-center text-[11px] font-body text-brand-subtle">
              Podés comprar sin registrarte. La cuenta te permite guardar
              tu historial y pre-completar el checkout.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}