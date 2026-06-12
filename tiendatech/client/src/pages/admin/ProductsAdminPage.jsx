/**
 * TiendaTech — pages/admin/ProductsAdminPage.jsx
 * Tabla de gestión de productos: buscar, filtrar, activar/desactivar, eliminar.
 *
 * Ubicación: /client/src/pages/admin/ProductsAdminPage.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';

const IconPlus   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEye    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0);

const CATEGORIES = ['', 'Teclados', 'Mouses', 'Monitores', 'Auriculares', 'PCs', 'Sillas', 'Accesorios'];

export default function ProductsAdminPage() {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [page,       setPage]       = useState(1);
  const [toDelete,   setToDelete]   = useState(null); // producto a confirmar eliminación
  const [actionLoading, setActionLoading] = useState(''); // id del producto con acción en curso

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ search, category, page, limit: 15 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (product) => {
    setActionLoading(product._id);
    try {
      await adminApi.toggleProduct(product._id);
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, isActive: !p.isActive } : p)
      );
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setActionLoading(toDelete._id);
    try {
      await adminApi.deleteProduct(toDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== toDelete._id));
      setToDelete(null);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-dark uppercase tracking-wide">
            Productos
          </h1>
          {pagination && (
            <p className="text-dark-600 font-body text-sm mt-1">
              {pagination.total} productos en total
            </p>
          )}
        </div>
        <Link to="/admin/products/new" className="btn-primary shrink-0">
          <IconPlus /> Nuevo producto
        </Link>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-brand-white border border-brand-muted
                        rounded-xl px-3 focus-within:border-red/50 transition-colors">
          <span className="text-dark-600"><IconSearch /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="flex-1 py-2.5 bg-transparent text-sm font-body text-dark
                       placeholder-brand-subtle focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-base w-auto shrink-0"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c || 'Todas las categorías'}</option>
          ))}
        </select>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="bg-brand-white rounded-2xl border border-brand-muted overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-display font-bold text-xl text-dark uppercase">Sin productos</p>
            <p className="text-dark-600 font-body text-sm mt-1">
              {search ? 'No hay resultados para tu búsqueda.' : 'Creá el primer producto.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-brand-muted bg-brand-surface">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-muted">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-brand-surface transition-colors ${
                      !product.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Producto */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover bg-brand-surface shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-dark text-sm truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-dark-600">{product.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge-category text-xs">{product.category}</span>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-medium text-dark">{fmt(product.price)}</span>
                      {product.isOnSale && (
                        <p className="text-xs text-red font-body">Oferta</p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className={`font-mono font-medium text-sm ${
                        product.stock === 0   ? 'text-red'
                        : product.stock <= 5  ? 'text-amber-600'
                        : 'text-dark'
                      }`}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Toggle activo */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(product)}
                        disabled={actionLoading === product._id}
                        title={product.isActive ? 'Desactivar' : 'Activar'}
                        className="relative inline-flex w-10 h-5 rounded-full transition-colors duration-200
                                   disabled:opacity-50 focus:outline-none"
                        style={{ backgroundColor: product.isActive ? '#E3000F' : '#D1D1D3' }}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                                      transition-transform duration-200
                                      ${product.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/producto/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver en tienda"
                          className="p-2 rounded-lg text-dark-600 hover:text-dark hover:bg-brand-surface
                                     transition-all duration-150"
                        >
                          <IconEye />
                        </a>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          title="Editar"
                          className="p-2 rounded-lg text-dark-600 hover:text-dark hover:bg-brand-surface
                                     transition-all duration-150"
                        >
                          <IconEdit />
                        </Link>
                        <button
                          onClick={() => setToDelete(product)}
                          title="Eliminar"
                          className="p-2 rounded-lg text-dark-600 hover:text-red hover:bg-red-subtle
                                     transition-all duration-150"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Paginación ──────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-brand-muted text-sm font-body
                       hover:border-dark transition-all disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-sm font-body text-dark-600 px-3">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-xl border border-brand-muted text-sm font-body
                       hover:border-dark transition-all disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* ── Modal de confirmación de eliminación ─────────────────────── */}
      {toDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm animate-fade-in"
               onClick={() => setToDelete(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-white rounded-2xl border border-brand-muted p-6 w-full max-w-sm
                            animate-fade-up shadow-card-hover">
              <h3 className="font-display font-bold text-xl text-dark uppercase tracking-wide mb-2">
                Eliminar producto
              </h3>
              <p className="text-dark-600 font-body text-sm mb-6">
                ¿Seguro que querés desactivar{' '}
                <span className="font-semibold text-dark">"{toDelete.name}"</span>?
                No se eliminará de la base de datos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setToDelete(null)}
                  className="flex-1 btn-outline text-sm py-2.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === toDelete._id}
                  className="flex-1 bg-red text-white font-body font-semibold text-sm
                             py-2.5 rounded-xl hover:bg-red-hover transition-all
                             disabled:opacity-50"
                >
                  {actionLoading === toDelete._id ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}