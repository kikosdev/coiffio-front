import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './OrderTrackingPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered']

export default function OrderTrackingPage() {
  const [params]         = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(params.get('orderNumber') ?? '')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function search(e) {
    e.preventDefault()
    setError(''); setOrder(null); setLoading(true)
    try {
      const res = await axios.get(`${API}/api/public/orders/${orderNumber}`, {
        params: email ? { email } : {},
      })
      setOrder(res.data)
    } catch {
      setError('Commande introuvable. Vérifiez le numéro et l\'email.')
    }
    setLoading(false)
  }

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1

  return (
    <div className="ot-page">
      <div className="ot-inner">
        <Link to="/shop" className="ot-back">← Boutique</Link>
        <h1 className="ot-title">Suivi de commande</h1>

        <form className="ot-form" onSubmit={search}>
          <label className="ot-label">
            Numéro de commande
            <input className="ot-input" value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="ORD-2026-000001" required />
          </label>
          <label className="ot-label">
            Email (invité)
            <input className="ot-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com" />
          </label>
          <button className="ot-submit" type="submit" disabled={loading}>
            {loading ? 'Recherche…' : 'Suivre'}
          </button>
        </form>

        {error && <p className="ot-error">{error}</p>}

        {order && (
          <div className="ot-result">
            <div className="ot-result-head">
              <div>
                <p className="ot-result-num">{order.orderNumber}</p>
                <p className="ot-result-total">{order.totalAmount?.toFixed(2)} €</p>
              </div>
              <span className="ot-status-badge">{STATUS_LABELS[order.status] ?? order.status}</span>
            </div>

            {/* Timeline */}
            {!['cancelled', 'refunded'].includes(order.status) && (
              <div className="ot-timeline">
                {STATUS_ORDER.map((s, i) => (
                  <div key={s} className={`ot-tl-step${i <= currentStep ? ' done' : ''}${i === currentStep ? ' current' : ''}`}>
                    <div className="ot-tl-dot" />
                    {i < STATUS_ORDER.length - 1 && <div className="ot-tl-line" />}
                    <span className="ot-tl-label">{STATUS_LABELS[s]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ot-items">
              <p className="ot-items-label">Articles</p>
              {order.items?.map((it, i) => (
                <div key={i} className="ot-item">
                  <span>{it.productName} × {it.quantity}</span>
                  <span>{it.lineTotal?.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
