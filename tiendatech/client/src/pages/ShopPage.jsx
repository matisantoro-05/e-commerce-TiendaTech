/**
 * TiendaTech — pages/ShopPage.jsx
 * Página principal del catálogo con grilla de productos, filtros y paginación.
 *
 * Ubicación: /client/src/pages/ShopPage.jsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams }    from 'react-router-dom';
import { useProducts }        from '../hooks/useProducts';
import ProductCard            from '../components/ProductCard';
import CategoryFilter         from '../components/CategoryFilter';

const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
const IconX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// Skeleton para las tarjetas mientras carga
function ProductSkeleton() {
  return (
    <div className="bg-brand-white rounded-2xl border border-brand-muted overflow-hidden">
      <div className="skeleton-box aspect-[4/3]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton-box h-4 w-1/3 rounded-lg" />
        <div className="skeleton-box h-4 w-2/3 rounded-lg" />
        <div className="skeleton-box h-4 w-1/2 rounded-lg" />
        <div className="skeleton-box h-10 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Leer filtros desde la URL (permite compartir links y back/forward del browser)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search:   searchParams.get('search')   || '',
    sort:     searchParams.get('sort')     || 'newest',
    onSale:   searchParams.get('onSale')   || '',
    featured: searchParams.get('featured') || '',
    page:     parseInt(searchParams.get('page') || '1', 10),
    limit:    12,
  });

  // Ref para evitar que setSearchParams dispare el efecto contrario
  const isSyncingFromUrl = useRef(false);

  // Sincronizar filtros → URL
  useEffect(() => {
    if (isSyncingFromUrl.current) return;
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search)   params.search   = filters.search;
    if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;
    if (filters.onSale)   params.onSale   = filters.onSale;
    if (filters.featured) params.featured = filters.featured;
    if (filters.page > 1) params.page     = filters.page;
    setSearchParams(params, { replace: true });
  }, [filters]); // eslint-disable-line

  // Sincronizar URL → filtros (cuando el Navbar navega con ?category=X)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch   = searchParams.get('search')   || '';
    setFilters((prev) => {
      // Si ya coinciden, no actualizar — corta el loop
      if (prev.category === urlCategory && prev.search === urlSearch) return prev;
      isSyncingFromUrl.current = true;
      setTimeout(() => { isSyncingFromUrl.current = false; }, 0);
      return { ...prev, category: urlCategory, search: urlSearch, page: 1 };
    });
  }, [searchParams]);

  const onFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Resetear a página 1 cuando cambia cualquier filtro que no sea la página
      ...(key !== 'page' && { page: 1 }),
    }));
  }, []);

  const { products, pagination, loading, error } = useProducts(filters);

  // Chips de filtros activos
  const activeChips = [
    filters.category && { key: 'category', label: filters.category },
    filters.search   && { key: 'search',   label: `"${filters.search}"` },
    filters.onSale   && { key: 'onSale',   label: 'En oferta' },
    filters.featured && { key: 'featured', label: 'Destacados' },
  ].filter(Boolean);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-dark uppercase tracking-wide leading-none">
          {filters.category || 'Todo el Catálogo'}
        </h1>
        {filters.search && (
          <p className="mt-2 text-dark-600 font-body text-sm">
            Resultados para{' '}
            <span className="font-semibold text-dark">"{filters.search}"</span>
          </p>
        )}
        {pagination && !loading && (
          <p className="mt-1 text-xs text-brand-subtle font-body">
            {pagination.totalCount} producto{pagination.totalCount !== 1 ? 's' : ''} encontrado{pagination.totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Chips de filtros activos ────────────────────────────────────── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key, '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         bg-dark text-white text-xs font-body font-medium
                         hover:bg-red transition-colors duration-200"
            >
              {chip.label}
              <IconX />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-8">

        {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <CategoryFilter filters={filters} onFilterChange={onFilterChange} />
          </div>
        </div>

        {/* ── Contenido principal ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Barra superior: toggle mobile sidebar */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-outline text-sm px-4 py-2"
            >
              <IconFilter /> Filtros
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-subtle border border-red/20 rounded-2xl p-6 text-center mb-8">
              <p className="text-red font-body font-medium">{error}</p>
            </div>
          )}

          {/* Grilla de productos */}
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="text-6xl">🔍</span>
              <p className="font-display font-bold text-2xl text-dark uppercase tracking-wide">
                Sin resultados
              </p>
              <p className="text-dark-600 font-body text-sm text-center max-w-xs">
                No encontramos productos con esos filtros. Probá con otros criterios.
              </p>
              <button
                onClick={() => {
                  setFilters({ category: '', search: '', sort: 'newest', onSale: '', featured: '', page: 1, limit: 12 });
                }}
                className="btn-dark mt-2"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => onFilterChange('page', filters.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2.5 rounded-xl border border-brand-muted text-dark-600
                           hover:border-dark hover:text-dark transition-all duration-200
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconChevL />
              </button>

              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                const isActive = page === pagination.currentPage;
                // Mostrar solo páginas cercanas a la actual
                if (
                  page === 1 || page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onFilterChange('page', page)}
                      className={`
                        w-10 h-10 rounded-xl text-sm font-body font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'bg-dark text-white shadow-dark-btn'
                          : 'border border-brand-muted text-dark-600 hover:border-dark hover:text-dark'}
                      `}
                    >
                      {page}
                    </button>
                  );
                }
                if (Math.abs(page - pagination.currentPage) === 2) {
                  return <span key={page} className="text-brand-subtle">…</span>;
                }
                return null;
              })}

              <button
                onClick={() => onFilterChange('page', filters.page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2.5 rounded-xl border border-brand-muted text-dark-600
                           hover:border-dark hover:text-dark transition-all duration-200
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconChevR />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sidebar móvil (drawer) ─────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-dark/50 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-brand-white
                            shadow-xl p-6 overflow-y-auto lg:hidden animate-slide-in-right
                            [animation-direction:reverse]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-dark uppercase tracking-wide">
                Filtros
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-brand-surface transition-colors"
              >
                <IconX />
              </button>
            </div>
            <CategoryFilter
              filters={filters}
              onFilterChange={(k, v) => {
                onFilterChange(k, v);
                setSidebarOpen(false);
              }}
            />
          </aside>
        </>
      )}
    </main>
  );
}