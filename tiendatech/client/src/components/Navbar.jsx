/**
 * TiendaTech — components/Navbar.jsx
 * Actualizado: botón login / avatar de perfil según estado del usuario.
 *
 * Ubicación: /client/src/components/Navbar.jsx
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const IconCart   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconMenu   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconProfile = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const CATEGORIES = ['Teclados', 'Mouses', 'Monitores', 'Auriculares', 'PCs'];

export default function Navbar({ onOpenAuth }) {
  const { totalItems, openCart }   = useCart();
  const { user, isLoggedIn, logout } = useUser();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [search,        setSearch]        = useState('');
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [prevTotal,     setPrevTotal]     = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems !== prevTotal && totalItems > 0) {
      setCartAnimating(true);
      const t = setTimeout(() => setCartAnimating(false), 350);
      setPrevTotal(totalItems);
      return () => clearTimeout(t);
    }
    setPrevTotal(totalItems);
  }, [totalItems]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  // Inicial del nombre para el avatar
  const initial = user?.fullName?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 bg-dark-800 text-white
        transition-shadow duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.4)]' : 'shadow-navbar'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group" aria-label="TiendaTech — Inicio">
              <span className="w-7 h-7 bg-red rounded-lg flex items-center justify-center
                               group-hover:bg-red-hover transition-colors duration-200">
                <span className="font-display font-bold text-white text-sm leading-none">T</span>
              </span>
              <span className="font-display font-bold text-white text-xl tracking-wide uppercase">
                Tienda<span className="text-red">Tech</span>
              </span>
            </Link>

            {/* Categorías desktop */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => navigate(`/?category=${encodeURIComponent(cat)}`)}
                  className="px-3 py-1.5 text-sm font-body font-medium text-white/70
                             rounded-lg hover:text-white hover:bg-white/10 transition-all duration-200">
                  {cat}
                </button>
              ))}
            </nav>

            {/* Buscador desktop */}
            <form onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-sm ml-auto items-center
                         bg-white/10 rounded-xl border border-white/10
                         hover:border-white/25 focus-within:border-red/60 focus-within:bg-white/15
                         transition-all duration-200">
              <span className="pl-3 text-white/50"><IconSearch /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white
                           placeholder-white/40 font-body focus:outline-none" />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="pr-3 text-white/40 hover:text-white transition-colors">
                  <IconX />
                </button>
              )}
            </form>

            {/* Acciones */}
            <div className="flex items-center gap-1 ml-auto md:ml-2">

              {/* ── Botón perfil / login ──────────────────────────────── */}
              {isLoggedIn ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    aria-label="Mi perfil"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                               text-white/80 hover:text-white hover:bg-white/10
                               transition-all duration-200"
                  >
                    {/* Avatar: foto de Google o inicial */}
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullName}
                           className="w-7 h-7 rounded-full object-cover border-2 border-white/20" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-red flex items-center justify-center
                                       text-white text-xs font-display font-bold">
                        {initial}
                      </span>
                    )}
                    <span className="hidden sm:block text-sm font-body font-medium max-w-[100px] truncate">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown menú */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10
                                    rounded-2xl shadow-xl overflow-hidden animate-fade-up
                                    [animation-fill-mode:forwards]">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-body font-semibold text-white truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-white/40 font-body truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <Link to="/perfil" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-body
                                     text-white/70 hover:text-white hover:bg-white/10
                                     transition-all duration-150">
                          <IconProfile /> Mi perfil
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body
                                     text-white/70 hover:text-red hover:bg-red/10
                                     transition-all duration-150">
                          <IconLogout /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  aria-label="Iniciar sesión"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                             text-white/70 hover:text-white hover:bg-white/10
                             text-sm font-body font-medium transition-all duration-200"
                >
                  <IconUser />
                  <span className="hidden sm:block">Ingresar</span>
                </button>
              )}

              {/* Carrito */}
              <button onClick={openCart}
                aria-label={`Carrito — ${totalItems} productos`}
                className="relative p-2.5 rounded-xl text-white/80 hover:text-white
                           hover:bg-white/10 transition-all duration-200">
                <IconCart />
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                    bg-red text-white text-[10px] font-body font-bold rounded-full
                    flex items-center justify-center
                    ${cartAnimating ? 'animate-pop' : ''}`}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Hamburguesa mobile */}
              <button onClick={() => setMobileOpen((o) => !o)} aria-label="Menú"
                className="lg:hidden p-2.5 rounded-xl text-white/80 hover:text-white
                           hover:bg-white/10 transition-all duration-200">
                {mobileOpen ? <IconX /> : <IconMenu />}
              </button>
            </div>
          </div>

          {/* Buscador móvil */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}
              className="flex items-center bg-white/10 rounded-xl border border-white/10
                         focus-within:border-red/60">
              <span className="pl-3 text-white/50"><IconSearch /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white
                           placeholder-white/40 font-body focus:outline-none" />
            </form>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-smooth
          ${mobileOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'}`}>
          <nav className="px-4 py-3 flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => { navigate(`/?category=${encodeURIComponent(cat)}`); setMobileOpen(false); }}
                className="text-left px-4 py-2.5 text-sm font-body font-medium
                           text-white/80 hover:text-white hover:bg-white/10
                           rounded-xl transition-all duration-200">
                {cat}
              </button>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2">
              {isLoggedIn ? (
                <>
                  <Link to="/perfil" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-body font-medium
                               text-white/80 hover:text-white hover:bg-white/10 rounded-xl
                               transition-all duration-200">
                    <IconProfile /> Mi perfil
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm
                               font-body font-medium text-white/80 hover:text-red hover:bg-red/10
                               rounded-xl transition-all duration-200">
                    <IconLogout /> Cerrar sesión
                  </button>
                </>
              ) : (
                <button onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm
                             font-body font-medium text-white/80 hover:text-white
                             hover:bg-white/10 rounded-xl transition-all duration-200">
                  <IconUser /> Iniciar sesión / Registrarse
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="h-16" aria-hidden="true" />
    </>
  );
}