/**
 * TiendaTech — pages/admin/AdminLayout.jsx
 * Layout del panel admin: sidebar + área de contenido.
 * Redirige a /admin si no hay sesión activa.
 *
 * Ubicación: /client/src/pages/admin/AdminLayout.jsx
 */

import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const IconDashboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconPackage   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconPlus      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconLogout    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconStore     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMenu      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: <IconDashboard /> },
  { to: '/admin/products',  label: 'Productos',  icon: <IconPackage /> },
  { to: '/admin/products/new', label: 'Nuevo producto', icon: <IconPlus /> },
];

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirigir si no está autenticado
  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-red rounded-lg flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-white text-sm">T</span>
          </span>
          <div>
            <p className="font-display font-bold text-white text-base uppercase tracking-wide leading-none">
              TiendaTech
            </p>
            <p className="text-white/30 text-[10px] font-body mt-0.5">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5 rounded-xl
              font-body font-medium text-sm transition-all duration-200
              ${isActive
                ? 'bg-red text-white shadow-red-btn'
                : 'text-white/60 hover:text-white hover:bg-white/10'}
            `}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="mt-4 pt-4 border-t border-white/10">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                       font-body font-medium text-sm text-white/60
                       hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <IconStore /> Ver tienda
          </a>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                     font-body font-medium text-sm text-white/50
                     hover:text-red hover:bg-red/10 transition-all duration-200"
        >
          <IconLogout /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-surface flex">

      {/* ── Sidebar desktop ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-dark-800 flex-col fixed top-0 bottom-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile overlay ────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-dark/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-56 bg-dark-800 flex flex-col lg:hidden
                            animate-slide-in-right [animation-direction:reverse]">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Contenido principal ───────────────────────────────────────── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Topbar mobile */}
        <header className="lg:hidden bg-dark-800 border-b border-white/10 px-4 h-14
                           flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10
                       transition-all duration-200"
          >
            <IconMenu />
          </button>
          <span className="font-display font-bold text-white text-base uppercase tracking-wide">
            Admin
          </span>
        </header>

        {/* Página actual */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}