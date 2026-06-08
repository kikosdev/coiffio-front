import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { usePublicCartStore } from '../../store/publicCartStore'
import './CheckoutPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STEPS = ['I — Identité', 'II — Livraison', 'III — Paiement']

function StepRail({ step }) {
  return (
    <div className="ck-rail">
      {STEPS.map((label, i) => (
        <div key={i} className={`ck-step${i === step ? ' active' : i < step ? ' done' : ''}`}>
          <div className="ck-step-dot">{i < step ? '✓' : null}</div>
          <span className="ck-step-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clear } = usePublicCartStore()
  const [step, setStep]   = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Form state
  const [guest, setGuest] = useState({ fullName: '', email: '', phone: '' })
  const [fulfillment, setFulfillment] = useState('pickup')
  const [address, setAddress] = useState({ fullName: '', phone: '', addressLine1: '', city: '', country: 'Maroc' })
  const [payment, setPayment] = useState('cod')
  const [notes, setNotes] = useState('')

  const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const shippingFee = fulfillment === 'delivery' ? 5 : 0
  const total       = subtotal + shippingFee

  const token = localStorage.getItem('haire_token')
  const role  = localStorage.getItem('haire_role')
  const isClient = token && role === 'client'

  function nextStep() {
    setError('')
    if (step === 0 && !isClient) {
      if (!guest.fullName || !guest.email || !guest.phone) {
        setError('Veuillez remplir tous les champs.')
        return
      }
    }
    if (step === 1 && fulfillment === 'delivery') {
      if (!address.fullName || !address.phone || !address.addressLine1 || !address.city) {
        setError('Veuillez remplir tous les champs de livraison.')
        return
      }
    }
    setStep(s => s + 1)
  }

  async function confirm() {
    setLoading(true)
    setError('')
    try {
      const dto = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod:   payment,
        fulfillmentType: fulfillment,
        notes,
        guest:           !isClient ? guest : undefined,
        shippingAddress: fulfillment === 'delivery' ? address : undefined,
      }

      const headers = isClient ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post(`${API}/api/public/orders`, dto, { headers })
      clear()
      navigate(`/shop/order/${res.data.orderNumber}`)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  if (!items.length) {
    return (
      <div className="ck-page">
        <div className="ck-inner">
          <Link to="/shop" className="ck-back">← Boutique</Link>
          <div className="ck-empty">Votre panier est vide. <Link to="/shop">Continuer les achats</Link></div>
        </div>
      </div>
    )
  }

  return (
    <div className="ck-page">
      <div className="ck-inner">
        <Link to="/shop/cart" className="ck-back">← Panier</Link>
        <h1 className="ck-title">Commander</h1>

        <StepRail step={step} />

        <div className="ck-layout">
          <div className="ck-form-area">

            {/* Step 0 — Identity */}
            {step === 0 && (
              <div className="ck-card">
                <h2 className="ck-card-title">Vos coordonnées</h2>
                {isClient ? (
                  <p className="ck-connected">Vous êtes connecté — vos informations seront associées à votre compte.</p>
                ) : (
                  <>
                    <label className="ck-label">
                      Nom complet
                      <input className="ck-input" value={guest.fullName}
                        onChange={e => setGuest(g => ({ ...g, fullName: e.target.value }))}
                        placeholder="Prénom Nom" />
                    </label>
                    <label className="ck-label">
                      Email
                      <input className="ck-input" type="email" value={guest.email}
                        onChange={e => setGuest(g => ({ ...g, email: e.target.value }))}
                        placeholder="votre@email.com" />
                    </label>
                    <label className="ck-label">
                      Téléphone
                      <input className="ck-input" value={guest.phone}
                        onChange={e => setGuest(g => ({ ...g, phone: e.target.value }))}
                        placeholder="+212 6XX XXX XXX" />
                    </label>
                    <p className="ck-hint">
                      Vous avez un compte ? <Link to="/signin">Se connecter</Link> pour un suivi simplifié.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Step 1 — Fulfillment */}
            {step === 1 && (
              <div className="ck-card">
                <h2 className="ck-card-title">Mode de réception</h2>
                <div className="ck-fulfillment">
                  <label className={`ck-opt${fulfillment === 'pickup' ? ' selected' : ''}`}>
                    <input type="radio" name="fulfillment" value="pickup"
                      checked={fulfillment === 'pickup'}
                      onChange={() => setFulfillment('pickup')} />
                    <div>
                      <span className="ck-opt-title">Retrait au salon</span>
                      <span className="ck-opt-sub">Gratuit · Disponible sous 24h</span>
                    </div>
                  </label>
                  <label className={`ck-opt${fulfillment === 'delivery' ? ' selected' : ''}`}>
                    <input type="radio" name="fulfillment" value="delivery"
                      checked={fulfillment === 'delivery'}
                      onChange={() => setFulfillment('delivery')} />
                    <div>
                      <span className="ck-opt-title">Livraison à domicile</span>
                      <span className="ck-opt-sub">+5,00 € · 2–4 jours ouvrés</span>
                    </div>
                  </label>
                </div>
                {fulfillment === 'delivery' && (
                  <div className="ck-address">
                    <label className="ck-label">
                      Nom du destinataire
                      <input className="ck-input" value={address.fullName}
                        onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} />
                    </label>
                    <label className="ck-label">
                      Téléphone
                      <input className="ck-input" value={address.phone}
                        onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} />
                    </label>
                    <label className="ck-label">
                      Adresse
                      <input className="ck-input" value={address.addressLine1}
                        onChange={e => setAddress(a => ({ ...a, addressLine1: e.target.value }))} />
                    </label>
                    <label className="ck-label">
                      Ville
                      <input className="ck-input" value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
                    </label>
                    <label className="ck-label">
                      Pays
                      <input className="ck-input" value={address.country}
                        onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 — Payment + recap */}
            {step === 2 && (
              <div className="ck-card">
                <h2 className="ck-card-title">Paiement</h2>
                <div className="ck-fulfillment">
                  <label className={`ck-opt${payment === 'cod' ? ' selected' : ''}`}>
                    <input type="radio" name="payment" value="cod"
                      checked={payment === 'cod'}
                      onChange={() => setPayment('cod')} />
                    <div>
                      <span className="ck-opt-title">Paiement à la livraison</span>
                      <span className="ck-opt-sub">Espèces ou carte à la réception</span>
                    </div>
                  </label>
                  <label className={`ck-opt${payment === 'card' ? ' selected' : ''}`}>
                    <input type="radio" name="payment" value="card"
                      checked={payment === 'card'}
                      onChange={() => setPayment('card')} />
                    <div>
                      <span className="ck-opt-title">Carte bancaire</span>
                      <span className="ck-opt-sub">Paiement sécurisé en ligne</span>
                    </div>
                  </label>
                </div>
                <label className="ck-label" style={{ marginTop: 18 }}>
                  Notes (optionnel)
                  <textarea className="ck-input ck-textarea" value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Instructions spéciales pour votre commande…" rows={3} />
                </label>
              </div>
            )}

            {error && <p className="ck-error">{error}</p>}

            <div className="ck-actions">
              {step > 0 && (
                <button className="ck-prev" onClick={() => setStep(s => s - 1)}>
                  ← Retour
                </button>
              )}
              {step < 2 ? (
                <button className="ck-next" onClick={nextStep}>
                  Suivant →
                </button>
              ) : (
                <button className="ck-confirm" onClick={confirm} disabled={loading}>
                  {loading ? 'Traitement…' : `Confirmer — ${total.toFixed(2)} €`}
                </button>
              )}
            </div>
          </div>

          {/* Order recap */}
          <div className="ck-recap">
            <h3 className="ck-recap-title">Récapitulatif</h3>
            {items.map(i => (
              <div key={i.productId} className="ck-recap-item">
                <span className="ck-recap-name">{i.productName} × {i.quantity}</span>
                <span className="ck-recap-price">{(i.unitPrice * i.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="ck-recap-sep" />
            <div className="ck-recap-item">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="ck-recap-item muted">
              <span>Livraison</span>
              <span>{fulfillment === 'delivery' ? '5,00 €' : 'Gratuit'}</span>
            </div>
            <div className="ck-recap-total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
