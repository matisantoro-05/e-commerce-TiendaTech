/**
 * TiendaTech — pages/admin/AdminLoginPage.jsx
 * Pantalla de login del panel de administración.
 *
 * Ubicación: /client/src/pages/admin/AdminLoginPage.jsx
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(password);
    if (ok) navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-9 h-9 bg-red rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-white text-base">T</span>
            </span>
            <span className="font-display font-bold text-white text-2xl uppercase tracking-wide">
              Tienda<span className="text-red">Tech</span>
            </span>
          </div>
          <p className="text-white/40 font-body text-sm mt-1">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="bg-dark-700 rounded-2xl border border-white/10 p-8">
          <h1 className="font-display font-bold text-white text-xl uppercase tracking-wide mb-6">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-body font-semibold text-white/50 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                className="w-full bg-dark-800 border border-white/10 rounded-xl
                           px-4 py-3 text-white placeholder-white/20 font-body text-sm
                           focus:outline-none focus:ring-2 focus:ring-red/40 focus:border-red/50
                           transition-all duration-200"
              />
            </div>

            {error && (
              <p className="text-red text-sm font-body bg-red/10 border border-red/20
                            rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full mt-2 disabled:opacity-50"
            >
              {loading ? 'Verificando…' : 'Ingresar al panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs font-body mt-6">
          TiendaTech Admin · Acceso restringido
        </p>
      </div>
    </div>
  );
}