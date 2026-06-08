import { useState, useEffect } from 'react'
import { useOrdersStore } from '../../store/ordersStore'
import './OrdersScreen.css'

const VALID_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready:     ['shipped', 'delivered', 'cancelled'],
  shipped:   ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded:  [],
}

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

export default function OrderDetailPage({ orderId, onBack }) {
  const { selected, isLoading, getById, updateStatus, updatePaymentStatus, updateNotes } = useOrdersStore()
  const [notes, setNotes]           = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null) // { status, label }
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    getById(orderId)
  }, [orderId])

  useEffect(() => {
    if (selected) setNotes(selected.internalNotes ?? '')
  }, [selected?._id])

  if (isLoading || !selected) {
    return (
      <div className="sh-page od-page">
        <button className="od-back" onClick={onBack}>← Retour aux commandes</button>
        <div className="od-loading">Chargement…</div>
      </div>
    )
  }

  const order = selected
  const transitions = VALID_TRANSITIONS[order.status] ?? []

  async function doTransition(status) {
    setTransitioning(true)
    try { await updateStatus(orderId, status) }
    catch { /* handled by store */ }
    setTransitioning(false)
    setConfirmModal(null)
  }

  async function saveNotes() {
    await updateNotes(orderId, notes)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  async function markPaid() {
    await updatePaymentStatus(orderId, 'paid')
  }

  const clientLabel = order.guest
    ? `${order.guest.fullName} (invité · ${order.guest.email})`
    : `Client connecté`

  return (
    <div className="sh-page od-page">
      <button className="od-back" onClick={onBack}>← Retour aux commandes</button>

      {/* Header */}
      <div className="od-header">
        <div className="od-header-left">
          <h1 className="od-num">{order.orderNumber}</h1>
          <span className="od-badge" style={{
            background: STATUS_COLORS[order.status]?.bg,
            color: STATUS_COLORS[order.status]?.color,
          }}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="od-header-right">
          <span className="od-total">{order.totalAmount?.toFixed(2)} €</span>
        </div>
      </div>

      {/* Actions */}
      {transitions.length > 0 && (
        <div className="od-actions">
          <span className="od-actions-label">Changer le statut :</span>
          {transitions.map(s => (
            <button
              key={s}
              className={`od-action-btn od-action-${s}`}
              onClick={() => setConfirmModal({ status: s, label: STATUS_LABELS[s] })}
              disabled={transitioning}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
            <button className="od-action-btn od-action-pay" onClick={markPaid}>
              Marquer payé
            </button>
          )}
        </div>
      )}

      <div className="od-grid">
        {/* Client */}
        <div className="od-card">
          <h3 className="od-card-title">Client</h3>
          <p className="od-card-value">{clientLabel}</p>
          {order.guest?.phone && <p className="od-card-sub">{order.guest.phone}</p>}
        </div>

        {/* Livraison */}
        <div className="od-card">
          <h3 className="od-card-title">Livraison</h3>
          <p className="od-card-value">
            {order.fulfillmentType === 'pickup' ? 'Retrait au salon' : 'Livraison à domicile'}
          </p>
          {order.shippingAddress && (
            <p className="od-card-sub">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}
            </p>
          )}
        </div>

        {/* Paiement */}
        <div className="od-card">
          <h3 className="od-card-title">Paiement</h3>
          <p className="od-card-value">
            {order.paymentMethod === 'cod'    ? 'Paiement à la livraison'
           : order.paymentMethod === 'card'   ? 'Carte bancaire'
           : 'En ligne'}
          </p>
          <p className="od-card-sub" style={{
            color: order.paymentStatus === 'paid' ? '#4a7c59' : '#c25e5e',
            fontWeight: 600,
          }}>
            {order.paymentStatus === 'paid' ? '✓ Payé'
           : order.paymentStatus === 'refunded' ? 'Remboursé' : 'Impayé'}
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="od-section">
        <h3 className="od-section-title">Articles</h3>
        <div className="od-items">
          {order.items?.map((it, i) => (
            <div key={i} className="od-item">
              <div className="od-item-info">
                <p className="od-item-name">{it.productName}</p>
                <p className="od-item-qty">× {it.quantity}</p>
              </div>
              <div className="od-item-prices">
                <p className="od-item-unit">{it.unitPrice?.toFixed(2)} € / u</p>
                <p className="od-item-total">{it.lineTotal?.toFixed(2)} €</p>
              </div>
            </div>
          ))}
          <div className="od-totals">
            <div className="od-total-row">
              <span>Sous-total</span>
              <span>{order.subtotal?.toFixed(2)} €</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="od-total-row">
                <span>Livraison</span>
                <span>{order.shippingFee?.toFixed(2)} €</span>
              </div>
            )}
            <div className="od-total-row bold">
              <span>Total</span>
              <span>{order.totalAmount?.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.statusHistory?.length > 0 && (
        <div className="od-section">
          <h3 className="od-section-title">Historique</h3>
          <div className="od-timeline">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="od-tl-row">
                <div className="od-tl-dot" />
                <div className="od-tl-info">
                  <span className="od-tl-status">{STATUS_LABELS[h.status] ?? h.status}</span>
                  <span className="od-tl-date">
                    {new Date(h.at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {h.note && <span className="od-tl-note">« {h.note} »</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes internes */}
      <div className="od-section">
        <h3 className="od-section-title">Notes internes</h3>
        <textarea
          className="od-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes visibles uniquement par les managers…"
          rows={3}
        />
        <button className="od-save-notes" onClick={saveNotes}>
          {notesSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {/* Confirm modal */}
      {confirmModal && (
        <div className="od-confirm-overlay" onClick={() => setConfirmModal(null)}>
          <div className="od-confirm-box" onClick={e => e.stopPropagation()}>
            <p className="od-confirm-q">
              Passer la commande en <strong>{confirmModal.label}</strong> ?
            </p>
            <div className="od-confirm-actions">
              <button className="od-confirm-cancel" onClick={() => setConfirmModal(null)}>Annuler</button>
              <button
                className={`od-confirm-ok${['cancelled','refunded'].includes(confirmModal.status) ? ' danger' : ''}`}
                onClick={() => doTransition(confirmModal.status)}
                disabled={transitioning}
              >
                {transitioning ? '…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
