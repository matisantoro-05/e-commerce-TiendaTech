/**
 * TiendaTech — components/ProductCard.jsx
 * Tarjeta de producto para la grilla del catálogo.
 *
 * Ubicación: /client/src/components/ProductCard.jsx
 */

import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useCart }  from '../context/CartContext';

const IconCart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

/**
 * @param {Object} props
 * @param {Object} props.product - Documento de producto de la API
 * @param {number} props.index   - Índice en la grilla (para delay del stagger)
 */
export default function ProductCard({ product, index = 0 }) {
  const { addToCart }    = useCart();
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inStock = product.stock > 0;

  // Delays de stagger para la entrada animada de la grilla
  const delayClasses = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-400'];
  const delayClass   = delayClasses[index % delayClasses.length];

  const handleAddToCart = (e) => {
    e.preventDefault(); // No navegar al hacer clic en el botón
    if (!inStock || added) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article
      className={`
        card group relative flex flex-col overflow-hidden
        animate-fade-up opacity-0 ${delayClass}
        [animation-fill-mode:forwards]
      `}
    >
      {/* ── Badges ───────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isOnSale && discountPercent > 0 && (
          <span className="badge-sale">
            −{discountPercent}%
          </span>
        )}
        {!inStock && (
          <span className="inline-flex items-center bg-dark/80 text-white/80
                           text-xs font-body font-medium px-2 py-0.5 rounded-md">
            Sin stock
          </span>
        )}
        {product.isFeatured && inStock && (
          <span className="inline-flex items-center bg-dark text-white
                           text-xs font-body font-medium px-2 py-0.5 rounded-md">
            Destacado
          </span>
        )}
      </div>

      {/* ── Imagen ───────────────────────────────────────────────────────── */}
      <Link
        to={`/producto/${product._id}`}
        className="block relative overflow-hidden bg-brand-surface"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={product.images?.[0] || product.mainImage}
            alt={product.name}
            loading="lazy"
            className={`
              w-full h-full object-cover
              transition-transform duration-500 ease-smooth
              group-hover:scale-105
              ${!inStock ? 'opacity-60 grayscale' : ''}
            `}
          />
        </div>

        {/* Overlay rojo muy sutil en hover */}
        <div className="absolute inset-0 bg-red/0 group-hover:bg-red/5
                        transition-colors duration-300 pointer-events-none" />
      </Link>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Categoría + rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="badge-category">{product.category}</span>
          {product.rating > 0 && (
            <span className="flex items-center gap-1 text-xs font-body text-dark-600">
              <span className="text-amber-400"><IconStar /></span>
              {product.rating.toFixed(1)}
              <span className="text-brand-subtle">({product.reviewCount})</span>
            </span>
          )}
        </div>

        {/* Marca */}
        <p className="text-xs font-body font-medium text-dark-600 uppercase tracking-wider mb-1">
          {product.brand}
        </p>

        {/* Nombre */}
        <Link
          to={`/producto/${product._id}`}
          className="block font-body font-semibold text-dark text-sm leading-snug
                     hover:text-red transition-colors duration-200 line-clamp-2 mb-3"
        >
          {product.name}
        </Link>

        {/* Spacer para empujar precio y botón al fondo */}
        <div className="flex-1" />

        {/* Precios */}
        <div className="flex items-end gap-2 mb-3">
          <span className="price-main">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Stock bajo */}
        {inStock && product.stock <= 5 && (
          <p className="text-xs font-body text-red font-medium mb-2">
            ¡Solo {product.stock} en stock!
          </p>
        )}

        {/* Botón añadir al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`
            w-full flex items-center justify-center gap-2
            py-2.5 px-4 rounded-xl text-sm font-body font-semibold
            transition-all duration-250
            ${added
              ? 'bg-green-500 text-white shadow-none scale-[0.98]'
              : inStock
                ? 'bg-dark text-white hover:bg-red hover:-translate-y-px shadow-dark-btn hover:shadow-red-btn'
                : 'bg-brand-surface text-brand-subtle cursor-not-allowed'
            }
          `}
        >
          {added ? (
            <><IconCheck /> Agregado</>
          ) : inStock ? (
            <><IconCart /> Añadir al carrito</>
          ) : (
            'Sin disponibilidad'
          )}
        </button>
      </div>
    </article>
  );
}