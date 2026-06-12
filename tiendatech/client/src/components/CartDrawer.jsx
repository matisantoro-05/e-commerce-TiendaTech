/**
 * TiendaTech — components/CartDrawer.jsx
 * Panel lateral del carrito con animación slide-in.
 *
 * Ubicación: /client/src/components/CartDrawer.jsx
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const IconX       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconMinus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconCart    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;

// ── Formatear precio en pesos argentinos ──────────────────────────────────────
const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function CartDrawer() {
  const {
    cart, isOpen, totalItems, totalPrice,
    removeFromCart, updateQuantity, clearCart, closeCart,
  } = useCart();

  const navigate = useNavigate();

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`
          fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm
          transition-opacity duration-350
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-full max-w-md bg-brand-white
          flex flex-col
          shadow-[−8px_0_40px_rgba(0,0,0,0.15)]
          transition-transform duration-350 ease-smooth
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-muted shrink-0">
          <div>
            <h2 className="font-display font-bold text-xl text-dark uppercase tracking-wide">
              Tu Carrito
            </h2>
            <p className="text-xs text-dark-600 font-body mt-0.5">
              {totalItems === 0
                ? 'Sin productos'
                : `${totalItems} producto${totalItems !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-brand-subtle hover:text-red font-body
                           transition-colors duration-200 px-2 py-1"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="p-2 rounded-xl text-dark-600 hover:text-dark hover:bg-brand-surface
                         transition-all duration-200"
            >
              <IconX />
            </button>
          </div>
        </div>

        {/* ── Lista de ítems ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          {cart.length === 0 ? (
            /* Estado vacío */
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <span className="text-brand-muted">
                <IconCart />
              </span>
              <div className="text-center">
                <p className="font-display font-bold text-lg text-dark uppercase tracking-wide">
                  Carrito vacío
                </p>
                <p className="text-sm text-dark-600 font-body mt-1">
                  Agregá productos para comenzar.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-dark text-sm px-5 py-2.5 mt-2"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.map(({ product, quantity }) => (
                <li
                  key={product._id}
                  className="flex gap-4 p-3 bg-brand-surface rounded-2xl
                             border border-brand-muted
                             animate-fade-up"
                >
                  {/* Imagen */}
                  <Link
                    to={`/producto/${product._id}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <img
                      src={product.images?.[0] || product.mainImage}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-brand-muted"
                    />
                  </Link>

                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${product._id}`}
                      onClick={closeCart}
                      className="block font-body font-medium text-sm text-dark
                                 leading-snug hover:text-red transition-colors
                                 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-dark-600 font-body mt-0.5">
                      {product.brand}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1 bg-brand-white
                                      border border-brand-muted rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          aria-label="Restar"
                          className="w-7 h-7 flex items-center justify-center rounded-md
                                     text-dark-600 hover:text-dark hover:bg-brand-surface
                                     transition-all duration-150"
                        >
                          <IconMinus />
                        </button>
                        <span className="w-8 text-center text-sm font-mono font-medium text-dark">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          aria-label="Sumar"
                          className="w-7 h-7 flex items-center justify-center rounded-md
                                     text-dark-600 hover:text-dark hover:bg-brand-surface
                                     transition-all duration-150
                                     disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <IconPlus />
                        </button>
                      </div>

                      {/* Subtotal + eliminar */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-sm text-dark">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          aria-label={`Eliminar ${product.name}`}
                          className="text-brand-subtle hover:text-red transition-colors duration-200"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer con total y checkout ─────────────────────────────── */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-muted shrink-0 bg-brand-white">
            {/* Envío */}
            <div className="flex items-center justify-between text-sm font-body mb-2">
              <span className="text-dark-600">Envío</span>
              <span className={totalPrice >= 100000 ? 'text-green-600 font-medium' : 'text-dark'}>
                {totalPrice >= 100000 ? 'Gratis 🎉' : formatPrice(5000)}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold text-lg text-dark uppercase tracking-wide">
                Total
              </span>
              <span className="font-mono font-medium text-2xl text-dark">
                {formatPrice(totalPrice >= 100000 ? totalPrice : totalPrice + 5000)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full text-base"
            >
              Ir al checkout
            </button>

            <button
              onClick={closeCart}
              className="w-full mt-2 text-sm text-dark-600 font-body
                         hover:text-dark transition-colors py-2"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}