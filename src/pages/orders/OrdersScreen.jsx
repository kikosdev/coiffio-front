import { useState, useEffect, useCallback } from 'react'
import { useOrdersStore } from '../../store/ordersStore'
import OrderDetailPage from './OrderDetailPage'
import './OrdersScreen.css'

const STATUS_TABS = [
  { key: '',          label: 'Toutes' },
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready',     label: 'Prêtes' },
  { key: 'shipped',   label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
]

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready:     'Prête',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded:  'Remboursée',
}

const STATUS_COLORS = {
  pending:   { bg: 'rgba(184,153,104,.12)', color: '#8a6a38' },
  confirmed: { bg: 'rgba(26,22,20,.08)',    color: '#1a1614' },
  preparing: { bg: 'rgba(184,153,104,.12)', color: '#b89968' },
  ready:     { bg: 'rgba(74,124,89,.12)',   color: '#4a7c59' },
  shipped:   { bg: 'rgba(74,124,89,.12)',   color: '#4a7c59' },
  delivered: { bg: 'rgba(74,124,89,.14)',   color: '#3d7a51' },
  cancelled: { bg: 'rgba(194,94,94,.1)',    color: '#c25e5e' },
  refunded:  { bg: 'rgba(194,94,94,.1)',    color: '#c25e5e' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] ?? { bg: '#f5f0e8', color: '#8a7f74' }
  return (
    <span className="ord-badge" style={{ background: c.bg, color: c.color }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function clientName(order) {
  if (order.guest) return order.guest.fullName
  return 'Client connecté'
}

export default function OrdersScreen() {
  const { orders, total, isLoading, stats, filters, fetch, fetchStats, setFilters } = useOrdersStore()
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch]       = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(() => fetch(), [filters])
  useEffect(() => { load() }, [load])
  useEffect(() => { fetchStats() }, [])

  function selectTab(key) {
    setActiveTab(key)
    setFilters({ status: key || undefined })
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    setFilters({ search: e.target.value || undefined })
  }

  if (selectedId) {
    return (
      <OrderDetailPage
        orderId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  return (
    <div className="sh-page ord-page">
      {/* KPI row */}
      {stats && (
        <div className="ord-kpi-row">
          <div className="ord-kpi">
            <p className="ord-kpi-label">Total commandes</p>
            <p className="ord-kpi-value">{stats.total}</p>
          </div>
          <div className="ord-kpi">
            <p className="ord-kpi-label">Aujourd&apos;hui</p>
            <p className="ord-kpi-value">{stats.todayCount}</p>
          </div>
          <div className="ord-kpi">
            <p className="ord-kpi-label">En attente</p>
            <p className="ord-kpi-value" style={{ color: '#b89968' }}>{stats.pending}</p>
          </div>
          <div className="ord-kpi">
            <p className="ord-kpi-label">CA en ligne</p>
            <p className="ord-kpi-value mono">{stats.totalRevenue?.toFixed(2)} €</p>
          </div>
          <div className="ord-kpi">
            <p className="ord-kpi-label">Panier moyen</p>
            <p className="ord-kpi-value mono">{stats.avgCartValue?.toFixed(2)} €</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="ord-tabs">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            className={`ord-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => selectTab(t.key)}
          >
            {t.label}
            {t.key === 'pending' && stats?.pending > 0 && (
              <span className="ord-tab-count">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ord-toolbar">
        <input
          className="ord-search"
          placeholder="Numéro de commande, nom client…"
          value={search}
          onChange={handleSearch}
        />
        <span className="ord-total">{total} commande{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="ord-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="ord-row-sk" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="ord-empty">
          <p>Aucune commande.</p>
        </div>
      ) : (
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Paiement</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="ord-row" onClick={() => setSelectedId(order._id)}>
                  <td className="ord-num">{order.orderNumber}</td>
                  <td className="ord-date">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="ord-client">{clientName(order)}</td>
                  <td className="ord-count">{order.items?.length ?? 0} art.</td>
                  <td className="ord-amount">{order.totalAmount?.toFixed(2)} €</td>
                  <td>
                    <span className={`ord-pay-badge ord-pay-${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? 'Payé' : order.paymentStatus === 'refunded' ? 'Remboursé' : 'Impayé'}
                    </span>
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
