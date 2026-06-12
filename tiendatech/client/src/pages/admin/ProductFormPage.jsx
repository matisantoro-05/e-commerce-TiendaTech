/**
 * TiendaTech — pages/admin/ProductFormPage.jsx
 * Formulario para crear y editar productos.
 * La misma página sirve para ambos casos — si hay :id en la URL, es edición.
 *
 * Ubicación: /client/src/pages/admin/ProductFormPage.jsx
 * Rutas:
 *   /admin/products/new        → crear
 *   /admin/products/:id/edit   → editar
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, productsApi } from '../../lib/api';

const IconPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
const IconArrow  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

const CATEGORIES = ['Teclados', 'Mouses', 'Monitores', 'Auriculares', 'PCs', 'Sillas', 'Accesorios'];

const EMPTY_FORM = {
  name:          '',
  description:   '',
  category:      'Teclados',
  brand:         '',
  price:         '',
  originalPrice: '',
  isOnSale:      false,
  stock:         '',
  isFeatured:    false,
  isActive:      true,
  rating:        '',
  reviewCount:   '',
  images:        [''],   // array de URLs
  specs:         [{ key: '', value: '' }],  // especificaciones técnicas
};

// ── Campo genérico ────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint  && <p className="text-xs text-dark-600 font-body">{hint}</p>}
      {error && <p className="text-xs text-red font-body">{error}</p>}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-5 bg-brand-muted rounded-full peer-checked:bg-red transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                        peer-checked:translate-x-5 transition-transform duration-200" />
      </div>
      <span className="text-sm font-body font-medium text-dark group-hover:text-dark-700">
        {label}
      </span>
    </label>
  );
}

export default function ProductFormPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEditing  = !!id && id !== 'new';

  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching,setFetching]= useState(isEditing);
  const [success, setSuccess] = useState('');
  const [apiErr,  setApiErr]  = useState('');

  // Si es edición, cargar los datos del producto
  useEffect(() => {
    if (!isEditing) return;
    productsApi.getById(id)
      .then((res) => {
        const p = res.data.data.product;
        setForm({
          name:          p.name          || '',
          description:   p.description   || '',
          category:      p.category      || 'Teclados',
          brand:         p.brand         || '',
          price:         p.price         ?? '',
          originalPrice: p.originalPrice ?? '',
          isOnSale:      p.isOnSale      || false,
          stock:         p.stock         ?? '',
          isFeatured:    p.isFeatured    || false,
          isActive:      p.isActive      !== false,
          rating:        p.rating        ?? '',
          reviewCount:   p.reviewCount   ?? '',
          images:        p.images?.length > 0 ? p.images : [''],
          specs:         p.specs?.length  > 0 ? p.specs  : [{ key: '', value: '' }],
        });
      })
      .catch(() => setApiErr('No se pudo cargar el producto.'))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  // Imágenes
  const setImage = (i, val) =>
    setForm((f) => { const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs }; });
  const addImage    = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  // Specs
  const setSpec = (i, field, val) =>
    setForm((f) => {
      const specs = [...f.specs];
      specs[i] = { ...specs[i], [field]: val };
      return { ...f, specs };
    });
  const addSpec    = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  const removeSpec = (i) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  // ── Validación ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name     = 'El nombre es obligatorio.';
    if (!form.description.trim()) e.description = 'La descripción es obligatoria.';
    if (!form.brand.trim())     e.brand    = 'La marca es obligatoria.';
    if (!form.price || Number(form.price) <= 0) e.price = 'Ingresá un precio válido.';
    if (!form.stock && form.stock !== 0) e.stock = 'El stock es obligatorio.';
    const validImages = form.images.filter((u) => u.trim());
    if (validImages.length === 0) e.images = 'Agregá al menos una URL de imagen.';
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr('');
    setSuccess('');

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);

    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      rating:        form.rating     ? Number(form.rating)     : 0,
      reviewCount:   form.reviewCount? Number(form.reviewCount): 0,
      images:        form.images.filter((u) => u.trim()),
      specs:         form.specs.filter((s) => s.key.trim() && s.value.trim()),
    };

    try {
      if (isEditing) {
        await adminApi.updateProduct(id, payload);
        setSuccess('✅ Producto actualizado correctamente.');
      } else {
        await adminApi.createProduct(payload);
        setSuccess('✅ Producto creado correctamente.');
        setForm(EMPTY_FORM);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setApiErr(err.message || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <Link to="/admin/products"
              className="inline-flex items-center gap-2 text-sm font-body text-dark-600
                         hover:text-dark transition-colors mb-3">
          <IconArrow /> Volver a productos
        </Link>
        <h1 className="font-display font-bold text-3xl text-dark uppercase tracking-wide">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      {/* Mensajes globales */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-green-700 font-body font-medium text-sm">{success}</p>
          <Link to="/admin/products" className="text-green-700 font-body text-sm underline">
            Ver productos
          </Link>
        </div>
      )}
      {apiErr && (
        <div className="bg-red-subtle border border-red/20 rounded-2xl px-5 py-4">
          <p className="text-red font-body font-medium text-sm">{apiErr}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Información básica ─────────────────────────────────────── */}
        <section className="bg-brand-white rounded-2xl border border-brand-muted p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Información básica
          </h2>

          <Field label="Nombre del producto *" error={errors.name}>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
                   placeholder="Ej: Keychron Q3 Pro TKL Wireless"
                   className={`input-base ${errors.name ? 'border-red' : ''}`} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Marca *" error={errors.brand}>
              <input value={form.brand} onChange={(e) => set('brand', e.target.value)}
                     placeholder="Ej: Keychron"
                     className={`input-base ${errors.brand ? 'border-red' : ''}`} />
            </Field>
            <Field label="Categoría *">
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                      className="input-base">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Descripción *" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describí el producto en detalle..."
              className={`input-base resize-none ${errors.description ? 'border-red' : ''}`}
            />
          </Field>
        </section>

        {/* ── Precios y stock ────────────────────────────────────────── */}
        <section className="bg-brand-white rounded-2xl border border-brand-muted p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Precios y stock
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio de venta * (ARS)" error={errors.price}>
              <input type="number" value={form.price}
                     onChange={(e) => set('price', e.target.value)}
                     placeholder="189990" min="0"
                     className={`input-base font-mono ${errors.price ? 'border-red' : ''}`} />
            </Field>
            <Field label="Precio original (ARS)"
                   hint="Dejar vacío si no tiene descuento">
              <input type="number" value={form.originalPrice}
                     onChange={(e) => set('originalPrice', e.target.value)}
                     placeholder="229990" min="0"
                     className="input-base font-mono" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock disponible *" error={errors.stock}>
              <input type="number" value={form.stock}
                     onChange={(e) => set('stock', e.target.value)}
                     placeholder="24" min="0"
                     className={`input-base font-mono ${errors.stock ? 'border-red' : ''}`} />
            </Field>
            <div className="flex flex-col gap-4 justify-center">
              <Toggle label="En oferta" checked={form.isOnSale}
                      onChange={(e) => set('isOnSale', e.target.checked)} />
            </div>
          </div>
        </section>

        {/* ── Imágenes ───────────────────────────────────────────────── */}
        <section className="bg-brand-white rounded-2xl border border-brand-muted p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Imágenes
          </h2>
          {errors.images && <p className="text-xs text-red font-body">{errors.images}</p>}

          <div className="flex flex-col gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="input-base"
                  />
                </div>
                {/* Preview */}
                {url.trim() && (
                  <img src={url} alt=""
                       className="w-11 h-11 rounded-xl object-cover border border-brand-muted shrink-0"
                       onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(i)}
                          className="p-2.5 rounded-xl text-dark-600 hover:text-red hover:bg-red-subtle
                                     transition-all duration-150 shrink-0">
                    <IconTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addImage}
                  className="btn-ghost text-sm self-start">
            <IconPlus /> Añadir imagen
          </button>
        </section>

        {/* ── Especificaciones técnicas ──────────────────────────────── */}
        <section className="bg-brand-white rounded-2xl border border-brand-muted p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Especificaciones técnicas
          </h2>

          <div className="flex flex-col gap-3">
            {form.specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => setSpec(i, 'key', e.target.value)}
                  placeholder="Ej: Switch"
                  className="input-base flex-1"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => setSpec(i, 'value', e.target.value)}
                  placeholder="Ej: Cherry MX Red"
                  className="input-base flex-1"
                />
                {form.specs.length > 1 && (
                  <button type="button" onClick={() => removeSpec(i)}
                          className="p-2.5 rounded-xl text-dark-600 hover:text-red hover:bg-red-subtle
                                     transition-all duration-150 shrink-0 mt-0.5">
                    <IconTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addSpec}
                  className="btn-ghost text-sm self-start">
            <IconPlus /> Añadir especificación
          </button>
        </section>

        {/* ── Visibilidad y extras ───────────────────────────────────── */}
        <section className="bg-brand-white rounded-2xl border border-brand-muted p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-sm text-dark uppercase tracking-widest">
            Visibilidad y valoración
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Toggle label="Producto activo (visible en tienda)"
                      checked={form.isActive}
                      onChange={(e) => set('isActive', e.target.checked)} />
              <Toggle label="Destacado en portada"
                      checked={form.isFeatured}
                      onChange={(e) => set('isFeatured', e.target.checked)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0-5)"
                     hint="Ej: 4.8">
                <input type="number" value={form.rating}
                       onChange={(e) => set('rating', e.target.value)}
                       min="0" max="5" step="0.1" placeholder="4.8"
                       className="input-base font-mono" />
              </Field>
              <Field label="Nº reseñas">
                <input type="number" value={form.reviewCount}
                       onChange={(e) => set('reviewCount', e.target.value)}
                       min="0" placeholder="142"
                       className="input-base font-mono" />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Botones de acción ──────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <Link to="/admin/products" className="btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50">
            {loading
              ? 'Guardando…'
              : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}