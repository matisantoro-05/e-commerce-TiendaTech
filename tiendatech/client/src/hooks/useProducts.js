/**
 * TiendaTech — hooks/useProducts.js
 * Custom hook para el catálogo de productos.
 *
 * Ubicación: /client/src/hooks/useProducts.js
 *
 * Encapsula fetch, loading, error, paginación y re-fetch automático
 * cuando cambian los filtros. Los componentes solo consumen el resultado.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { productsApi } from '../lib/api';

/**
 * @param {Object} filters - Objeto con los filtros activos
 * @param {string}  filters.category
 * @param {string}  filters.search
 * @param {string}  filters.sort
 * @param {number}  filters.page
 * @param {number}  filters.limit
 * @param {boolean} filters.onSale
 */
export function useProducts(filters = {}) {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Ref para cancelar fetch si el componente se desmonta o los filtros cambian
  const abortRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    // Cancelar request anterior si sigue en vuelo
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Limpiar params vacíos antes de enviar
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );

      const response = await productsApi.getAll(cleanParams);
      const { products: data, pagination: pages } = response.data.data;

      setProducts(data);
      setPagination(pages);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err.message || 'Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => {
    fetchProducts();
    return () => abortRef.current?.abort();
  }, [fetchProducts]);

  return { products, pagination, loading, error, refetch: fetchProducts };
}

/**
 * Hook para obtener el detalle de un producto por id o slug.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.getById(id);
        if (!cancelled) {
          setProduct(res.data.data.product);
          setRelated(res.data.data.related || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { product, related, loading, error };
}

/**
 * Hook para obtener las categorías disponibles.
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    productsApi.getCategories()
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}