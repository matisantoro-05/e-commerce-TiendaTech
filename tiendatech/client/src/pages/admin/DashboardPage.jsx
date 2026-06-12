/**
 * TiendaTech — pages/admin/DashboardPage.jsx
 * Panel de métricas: KPIs, gráfico de ingresos, top productos, órdenes recientes.
 *
 * Ubicación: /client/src/pages/admin/DashboardPage.jsx
 */

import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';

// ── Formateo ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0);
const fmtNum = (n) => new Intl.NumberFormat('es-AR').format(n ?? 0);

// ── Status badges ─────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:    { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700' },
  paid:       { label: 'Pagado',      color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En proceso',  color: 'bg-purple-100 text-purple-700' },
  shipped:    { label: 'Enviado',     color: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelado',   color: 'bg-brand-muted text-dark-600' },
  failed:     { label: 'Fallido',     color: 'bg-red-subtle text-red' },
  refunded:   { label: 'Reembolsado', color: 'bg-orange-100 text-orange-700' },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, change, icon, accent }) {
  const isPositive = change > 0;
  const isNeutral  = change === null || change === undefined;
  return (
    <div className="bg-brand-white rounded-2xl border border-brand-muted p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-body font-semibold text-dark-600 uppercase tracking-wider">{title}</p>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${accent}`}>{icon}</span>
      </div>
      <p className="font-mono font-semibold text-2xl text-dark leading-none">{value}</p>
      <div className="flex items-center gap-2">
        {!isNeutral && (
          <span className={`text-xs font-body font-semibold px-1.5 py-0.5 rounded-md
            ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-subtle text-red'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
        <span className="text-xs text-dark-600 font-body">{sub}</span>
      </div>
    </div>
  );
}

// ── Mini bar chart (SVG puro, sin librería) ────────────────────────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="h-40 flex items-center justify-center text-dark-600 text-sm font-body">
      Sin datos aún
    </div>
  );

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  const W = 600, H = 120, pad = 4;
  const barW = (W - pad * (data.length + 1)) / data.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full min-w-[320px]" preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = Math.max(2, (d.revenue / maxVal) * H);
          const x = pad + i * (barW + pad);
          const y = H - barH;
          return (
            <g key={d._id}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx="3"
                className="fill-red/80 hover:fill-red transition-colors"
              />
              {/* Label de fecha cada 7 días */}
              {i % 7 === 0 && (
                <text x={x + barW / 2} y={H + 16} textAnchor="middle"
                      fontSize="9" fill="#9CA3AF" fontFamily="DM Sans, sans-serif">
                  {d._id.slice(5)} {/* MM-DD */}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red font-body">{error}</p>
    </div>
  );

  const kpis = data?.kpis;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display font-bold text-3xl text-dark uppercase tracking-wide">
          Dashboard
        </h1>
        <p className="text-dark-600 font-body text-sm mt-1">
          Resumen general de TiendaTech
        </p>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)
        ) : (
          <>
            <KpiCard
              title="Ingresos totales"
              value={fmt(kpis.revenueTotal)}
              sub="Órdenes pagadas"
              change={null}
              icon="💰"
              accent="bg-green-50"
            />
            <KpiCard
              title="Este mes"
              value={fmt(kpis.revenueThisMonth)}
              sub="vs mes anterior"
              change={kpis.revenueChange}
              icon="📈"
              accent="bg-blue-50"
            />
            <KpiCard
              title="Órdenes pagas"
              value={fmtNum(kpis.totalOrders)}
              sub={`${fmtNum(kpis.ordersThisMonth)} este mes`}
              change={kpis.ordersChange}
              icon="🛒"
              accent="bg-purple-50"
            />
            <KpiCard
              title="Productos activos"
              value={fmtNum(kpis.activeProducts)}
              sub={kpis.lowStockProducts > 0
                ? `⚠ ${kpis.lowStockProducts} con stock bajo`
                : 'Stock normal'}
              change={null}
              icon="📦"
              accent="bg-amber-50"
            />
          </>
        )}
      </div>

      {/* ── Gráfico de ingresos + órdenes por estado ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de barras — ingresos 30 días */}
        <div className="lg:col-span-2 bg-brand-white rounded-2xl border border-brand-muted p-6">
          <h2 className="font-display font-bold text-base text-dark uppercase tracking-wide mb-4">
            Ingresos últimos 30 días
          </h2>
          {loading
            ? <Skeleton className="h-36" />
            : <RevenueChart data={data?.revenueByDay} />
          }
        </div>

        {/* Órdenes por estado */}
        <div className="bg-brand-white rounded-2xl border border-brand-muted p-6">
          <h2 className="font-display font-bold text-base text-dark uppercase tracking-wide mb-4">
            Estado de órdenes
          </h2>
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : data?.ordersByStatus?.length === 0 ? (
            <p className="text-dark-600 font-body text-sm">Sin órdenes aún.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data?.ordersByStatus?.map((s) => {
                const cfg = STATUS_LABELS[s._id] || { label: s._id, color: 'bg-brand-surface text-dark' };
                return (
                  <li key={s._id} className="flex items-center justify-between">
                    <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-lg ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="font-mono text-sm font-medium text-dark">{s.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Top productos + Órdenes recientes ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 más vendidos */}
        <div className="bg-brand-white rounded-2xl border border-brand-muted p-6">
          <h2 className="font-display font-bold text-base text-dark uppercase tracking-wide mb-4">
            Productos más vendidos
          </h2>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : data?.topProducts?.length === 0 ? (
            <p className="text-dark-600 font-body text-sm">Sin ventas registradas aún.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-brand-muted">
              {data?.topProducts?.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-6 h-6 rounded-full bg-brand-surface flex items-center justify-center
                                   text-xs font-mono font-bold text-dark-600 shrink-0">
                    {i + 1}
                  </span>
                  <img src={p.image} alt={p.name}
                       className="w-10 h-10 rounded-xl object-cover bg-brand-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-dark truncate">{p.name}</p>
                    <p className="text-xs text-dark-600 font-body">{fmtNum(p.unitsSold)} unidades</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-dark shrink-0">
                    {fmt(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Órdenes recientes */}
        <div className="bg-brand-white rounded-2xl border border-brand-muted p-6">
          <h2 className="font-display font-bold text-base text-dark uppercase tracking-wide mb-4">
            Órdenes recientes
          </h2>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : data?.recentOrders?.length === 0 ? (
            <p className="text-dark-600 font-body text-sm">Sin órdenes aún.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-brand-muted">
              {data?.recentOrders?.map((order) => {
                const cfg = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-brand-surface text-dark' };
                return (
                  <li key={order._id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-dark">{order.orderNumber}</p>
                      <p className="text-xs text-dark-600 font-body truncate">
                        {order.shippingAddress?.fullName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-md ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-mono text-xs font-semibold text-dark">
                        {fmt(order.total)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Alertas de stock bajo ─────────────────────────────────────── */}
      {!loading && kpis?.lowStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-body font-semibold text-amber-800">
              {kpis.lowStockProducts} producto{kpis.lowStockProducts > 1 ? 's' : ''} con stock bajo (≤5 unidades)
            </p>
            <p className="text-sm text-amber-700 font-body mt-0.5">
              Revisá el inventario en la sección de Productos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}