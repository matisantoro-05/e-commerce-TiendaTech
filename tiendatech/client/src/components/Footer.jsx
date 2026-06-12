/**
 * TiendaTech — components/Footer.jsx
 * Ubicación: /client/src/components/Footer.jsx
 */

import { Link } from 'react-router-dom';

const CATEGORIES = ['Teclados', 'Mouses', 'Monitores', 'Auriculares', 'PCs'];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Marca ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-red rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">T</span>
              </span>
              <span className="font-display font-bold text-white text-xl uppercase tracking-wide">
                Tienda<span className="text-red">Tech</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 font-body leading-relaxed max-w-xs">
              Hardware gamer premium. Teclados, mouses, monitores, auriculares y PCs
              de alto rendimiento para jugadores que exigen lo mejor.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span className="text-xs font-body text-white/30 uppercase tracking-widest">
                Pagos seguros con
              </span>
              <span className="text-xs font-body font-semibold text-white/60 bg-white/10
                               px-2 py-1 rounded-md">
                Mercado Pago
              </span>
            </div>
          </div>

          {/* ── Categorías ─────────────────────────────────────────────── */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest
                           text-white/40 mb-4">
              Categorías
            </h4>
            <ul className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    className="text-sm font-body text-white/60 hover:text-white
                               transition-colors duration-200"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Info ───────────────────────────────────────────────────── */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest
                           text-white/40 mb-4">
              Información
            </h4>
            <ul className="flex flex-col gap-2">
              {['Envíos', 'Devoluciones', 'Garantías', 'Contacto'].map((item) => (
                <li key={item}>
                  <span className="text-sm font-body text-white/60 cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-xs font-body text-white/30">
            © {year} TiendaTech. Todos los derechos reservados.
          </p>
          <p className="text-xs font-body text-white/20">
            Hecho con React + Node.js + MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}