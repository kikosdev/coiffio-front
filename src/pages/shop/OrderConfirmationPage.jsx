import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import './OrderConfirmationPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STATUS_LABELS = {
  pending:   'En attente de confirmation',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready:     'Prête',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded:  'Remboursée',
}

const STATUS_COLORS = {
  pending:   '#b89968',
  confirmed: '#1a1614',
  preparing: '#b89968',
  ready:     '#4a7c59',
  shipped:   '#4a7c59',
  delivered: '#4a7c59',
  cancelled: '#c25e5e',
  refunded:  '#c25e5e',
}

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/public/orders/${orderNumber}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [orderNumber])

  if (loading) return <div className="oc-loading">Chargement…</div>

  return (
    <div className="oc-page">
      <div className="oc-inner">
        <div className="oc-hero">
          <div className="oc-check">✓</div>
          <h1 className="oc-title">Commande reçue !</h1>
          <p className="oc-sub">Merci pour votre confiance. Votre commande a bien été enregistrée.</p>
        </div>

        {order && (
          <div className="oc-card">
            <div className="oc-row">
              <span className="oc-label">Numéro de commande</span>
              <span className="oc-value mono">{order.orderNumber}</span>
            </div>
            <div className="oc-row">
              <span className="oc-label">Statut</span>
              <span className="oc-badge" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="oc-row">
              <span className="oc-label">Total</span>
              <span className="oc-value mono">{order.totalAmount?.toFixed(2)} €</span>
            </div>
            <div className="oc-row">
              <span className="oc-label">Mode de réception</span>
              <span className="oc-value">{order.fulfillmentType === 'pickup' ? 'Retrait au salon' : 'Livraison'}</span>
            </div>
            <div className="oc-items">
              <p className="oc-items-label">Articles commandés</p>
              {order.items?.map((it, i) => (
                <div key={i} className="oc-item">
                  <span>{it.productName} × {it.quantity}</span>
                  <span className="mono">{it.lineTotal?.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="oc-track-box">
          <p className="oc-track-text">Suivre votre commande</p>
          <Link to={`/shop/track?orderNumber=${orderNumber}`} className="oc-track-link">
            Suivre en ligne →
          </Link>
        </div>

        <div className="oc-actions">
          <Link to="/shop" className="oc-continue">← Continuer mes achats</Link>
          <Link to="/" className="oc-home">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  )
}
