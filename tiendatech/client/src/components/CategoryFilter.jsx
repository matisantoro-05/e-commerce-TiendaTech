/**
 * TiendaTech — components/CategoryFilter.jsx
 * Panel de filtros: categorías, ordenamiento y opciones extra.
 *
 * Ubicación: /client/src/components/CategoryFilter.jsx
 */

import { useCategories } from '../hooks/useProducts';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Más recientes'   },
  { value: 'price_asc', label: 'Menor precio'    },
  { value: 'price_desc',label: 'Mayor precio'    },
  { value: 'rating',    label: 'Mejor valorados' },
  { value: 'name_asc',  label: 'Nombre A→Z'      },
];

/**
 * @param {Object}   props
 * @param {Object}   props.filters       - Filtros activos del padre
 * @param {Function} props.onFilterChange - Callback para actualizar un filtro
 */
export default function CategoryFilter({ filters, onFilterChange }) {
  const { categories, loading } = useCategories();

  const activeCategory = filters.category || 'Todos';
  const activeSort     = filters.sort     || 'newest';

  return (
    <aside className="flex flex-col gap-6">

      {/* ── Categorías ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title text-xs mb-3">Categorías</h3>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-box h-9 rounded-xl" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {/* Opción "Todos" */}
            <li>
              <button
                onClick={() => onFilterChange('category', '')}
                className={`
                  w-full text-left px-4 py-2 rounded-xl text-sm font-body font-medium
                  transition-all duration-200 flex items-center justify-between
                  ${activeCategory === 'Todos'
                    ? 'bg-dark text-white shadow-dark-btn'
                    : 'text-dark-600 hover:bg-brand-surface hover:text-dark'}
                `}
              >
                <span>Todos</span>
              </button>
            </li>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <li key={cat.name}>
                  <button
                    onClick={() => onFilterChange('category', isActive ? '' : cat.name)}
                    className={`
                      w-full text-left px-4 py-2 rounded-xl text-sm font-body font-medium
                      transition-all duration-200 flex items-center justify-between
                      ${isActive
                        ? 'bg-red text-white shadow-red-btn'
                        : 'text-dark-600 hover:bg-brand-surface hover:text-dark'}
                    `}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`
                        text-xs px-1.5 py-0.5 rounded-md font-mono
                        ${isActive ? 'bg-white/20 text-white' : 'bg-brand-muted text-dark-600'}
                      `}
                    >
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Ordenamiento ───────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title text-xs mb-3">Ordenar por</h3>
        <ul className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.value;
            return (
              <li key={opt.value}>
                <button
                  onClick={() => onFilterChange('sort', opt.value)}
                  className={`
                    w-full text-left px-4 py-2 rounded-xl text-sm font-body
                    transition-all duration-200 flex items-center gap-2
                    ${isActive
                      ? 'text-dark font-semibold bg-brand-surface'
                      : 'text-dark-600 font-medium hover:bg-brand-surface hover:text-dark'}
                  `}
                >
                  {/* Indicador activo */}
                  <span
                    className={`
                      w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200
                      ${isActive ? 'bg-red scale-125' : 'bg-brand-muted'}
                    `}
                  />
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Filtros extra ──────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title text-xs mb-3">Filtros</h3>
        <div className="flex flex-col gap-2">

          {/* Toggle: Solo ofertas */}
          <label className="flex items-center justify-between px-4 py-2.5 rounded-xl
                            bg-brand-surface border border-brand-muted cursor-pointer
                            hover:border-red/40 transition-colors duration-200 group">
            <span className="text-sm font-body font-medium text-dark-600 group-hover:text-dark
                             transition-colors">
              Solo ofertas
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.onSale === 'true' || filters.onSale === true}
                onChange={(e) => onFilterChange('onSale', e.target.checked ? 'true' : '')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-brand-muted rounded-full
                              peer-checked:bg-red
                              transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                              peer-checked:translate-x-5
                              transition-transform duration-200" />
            </div>
          </label>

          {/* Toggle: Destacados */}
          <label className="flex items-center justify-between px-4 py-2.5 rounded-xl
                            bg-brand-surface border border-brand-muted cursor-pointer
                            hover:border-red/40 transition-colors duration-200 group">
            <span className="text-sm font-body font-medium text-dark-600 group-hover:text-dark
                             transition-colors">
              Destacados
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.featured === 'true' || filters.featured === true}
                onChange={(e) => onFilterChange('featured', e.target.checked ? 'true' : '')}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-brand-muted rounded-full
                              peer-checked:bg-red
                              transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                              peer-checked:translate-x-5
                              transition-transform duration-200" />
            </div>
          </label>
        </div>
      </div>

      {/* ── Limpiar filtros ────────────────────────────────────────────── */}
      {(filters.category || filters.sort !== 'newest' || filters.onSale || filters.featured) && (
        <button
          onClick={() => {
            onFilterChange('category', '');
            onFilterChange('sort', 'newest');
            onFilterChange('onSale', '');
            onFilterChange('featured', '');
          }}
          className="text-sm font-body font-medium text-red hover:text-red-hover
                     transition-colors duration-200 text-left px-4"
        >
          × Limpiar filtros
        </button>
      )}
    </aside>
  );
}