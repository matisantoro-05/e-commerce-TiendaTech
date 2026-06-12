/**
 * TiendaTech — pages/ProductDetailPage.jsx
 * Detalle completo de un producto: imágenes, specs, stock, carrito.
 *
 * Ubicación: /client/src/pages/ProductDetailPage.jsx
 * Ruta: /producto/:id
 */

import { useState }        from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct }      from '../hooks/useProducts';
import { useCart }         from '../context/CartContext';
import ProductCard         from '../components/ProductCard';

const IconCart    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconCheck   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconStar    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconPlus    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconMinus   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconShield  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconTruck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconReturn  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.31"/></svg>;

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

// ── Skeleton de carga ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="skeleton-box h-4 w-48 rounded-lg mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="skeleton-box aspect-square rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="skeleton-box h-6 w-1/4 rounded-lg" />
          <div className="skeleton-box h-10 w-3/4 rounded-lg" />
          <div className="skeleton-box h-8 w-1/3 rounded-lg" />
          <div className="skeleton-box h-32 rounded-xl" />
          <div className="skeleton-box h-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id }                      = useParams();
  const { product, related, loading, error } = useProduct(id);
  const { addToCart }               = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity,      setQuantity]      = useState(1);
  const [added,         setAdded]         = useState(false);

  if (loading) return <DetailSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">😕</p>
        <h1 className="font-display font-bold text-3xl text-dark uppercase mb-3">
          Producto no encontrado
        </h1>
        <p className="text-dark-600 font-body mb-8">{error || 'El producto que buscás no existe.'}</p>
        <Link to="/" className="btn-dark">← Volver al catálogo</Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock || added) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-body text-dark-600 mb-8">
        <Link to="/" className="hover:text-red transition-colors flex items-center gap-1">
          <IconArrow /> Catálogo
        </Link>
        <span className="text-brand-muted">/</span>
        <Link
          to={`/?category=${product.category}`}
          className="hover:text-red transition-colors"
        >
          {product.category}
        </Link>
        <span className="text-brand-muted">/</span>
        <span className="text-dark truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* ── Layout principal ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

        {/* ── Galería de imágenes ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Imagen principal */}
          <div className="relative aspect-square bg-brand-surface rounded-2xl overflow-hidden
                          border border-brand-muted group">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500
                         group-hover:scale-[1.03]"
            />
            {product.isOnSale && discountPercent > 0 && (
              <span className="absolute top-4 left-4 badge-sale text-sm px-3 py-1">
                −{discountPercent}%
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`
                    shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200
                    ${i === selectedImage
                      ? 'border-red shadow-red-glow'
                      : 'border-brand-muted hover:border-brand-subtle'}
                  `}
                >
                  <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info del producto ────────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Marca + categoría */}
          <div className="flex items-center gap-3 mb-3">
            <span className="badge-category">{product.category}</span>
            <span className="text-sm font-body font-semibold text-dark-600 uppercase tracking-wider">
              {product.brand}
            </span>
          </div>

          {/* Nombre */}
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-dark uppercase
                         tracking-wide leading-tight mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(product.rating) ? 'opacity-100' : 'opacity-25'}>
                    <IconStar />
                  </span>
                ))}
              </div>
              <span className="text-sm font-body text-dark font-medium">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm font-body text-dark-600">
                ({product.reviewCount} reseñas)
              </span>
            </div>
          )}

          {/* Precio */}
          <div className="flex items-end gap-3 mb-2">
            <span className="font-mono font-medium text-4xl text-dark">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono text-xl text-brand-subtle line-through mb-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-body font-medium mb-6 ${
            !inStock         ? 'text-red'
            : product.stock <= 5 ? 'text-amber-600'
            : 'text-green-600'
          }`}>
            {!inStock
              ? '✕ Sin stock disponible'
              : product.stock <= 5
                ? `⚠ Solo ${product.stock} unidades disponibles`
                : `✓ En stock (${product.stock} disponibles)`}
          </p>

          {/* Descripción */}
          <p className="text-sm font-body text-dark-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Selector de cantidad + botón */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              {/* Cantidad */}
              <div className="flex items-center border border-brand-muted rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-600
                             hover:bg-brand-surface hover:text-dark transition-all duration-150"
                >
                  <IconMinus />
                </button>
                <span className="w-12 text-center font-mono font-medium text-dark text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-600
                             hover:bg-brand-surface hover:text-dark transition-all duration-150"
                >
                  <IconPlus />
                </button>
              </div>

              {/* Subtotal */}
              <span className="text-sm font-body text-dark-600">
                Subtotal:{' '}
                <span className="font-mono font-semibold text-dark">
                  {formatPrice(product.price * quantity)}
                </span>
              </span>
            </div>
          )}

          {/* Botón añadir al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`
              w-full flex items-center justify-center gap-2 py-4
              rounded-xl text-base font-body font-semibold
              transition-all duration-250
              ${added
                ? 'bg-green-500 text-white'
                : inStock
                  ? 'btn-primary'
                  : 'bg-brand-surface text-brand-subtle cursor-not-allowed'}
            `}
          >
            {added ? <><IconCheck /> ¡Agregado al carrito!</>
                   : inStock
                     ? <><IconCart /> Añadir al carrito</>
                     : 'Sin disponibilidad'}
          </button>

          {/* Garantías */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-brand-muted">
            {[
              { icon: <IconShield />, label: '12 meses\nde garantía' },
              { icon: <IconTruck />,  label: 'Envío gratis\n+$100.000' },
              { icon: <IconReturn />, label: '30 días\npara devolver' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5">
                <span className="text-dark-600">{icon}</span>
                <span className="text-[11px] font-body text-dark-600 leading-tight whitespace-pre-line">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Especificaciones técnicas ─────────────────────────────────── */}
      {product.specs?.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl mb-6">
            Especificaciones técnicas
          </h2>
          <div className="bg-brand-surface rounded-2xl border border-brand-muted overflow-hidden">
            <table className="w-full text-sm font-body">
              <tbody>
                {product.specs.map((spec, i) => (
                  <tr
                    key={spec.key}
                    className={`
                      flex flex-col sm:table-row
                      ${i % 2 === 0 ? 'bg-brand-white' : 'bg-brand-surface'}
                      border-b border-brand-muted last:border-0
                    `}
                  >
                    <td className="px-6 py-3 font-semibold text-dark-600 sm:w-48 shrink-0">
                      {spec.key}
                    </td>
                    <td className="px-6 pb-3 sm:py-3 text-dark font-mono text-xs sm:text-sm">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Productos relacionados ────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl mb-6">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}