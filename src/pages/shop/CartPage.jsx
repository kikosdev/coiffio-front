import { Link, useNavigate } from 'react-router-dom'
import { usePublicCartStore } from '../../store/publicCartStore'
import './CartPage.css'

export default function CartPage() {
  const { items, updateQuantity, remove } = usePublicCartStore()
  const navigate = useNavigate()

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  if (!items.length) {
    return (
      <div className="cart-page">
        <div className="cart-inner">
          <Link to="/shop" className="cart-back">← Boutique</Link>
          <div className="cart-empty">
            <p className="cart-empty-title">Votre panier est vide</p>
            <Link to="/shop" className="cart-cta">Découvrir nos produits</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <Link to="/shop" className="cart-back">← Boutique</Link>
        <h1 className="cart-title">Panier</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">{item.productName[0]}</div>
                  )}
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">{item.unitPrice.toFixed(2)} € / unité</p>
                </div>
                <div className="cart-item-stepper">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">{(item.unitPrice * item.quantity).toFixed(2)} €</p>
                <button className="cart-item-remove" onClick={() => remove(item.productId)} aria-label="Supprimer">×</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="cart-sum-title">Récapitulatif</h2>
            <div className="cart-sum-row">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="cart-sum-row muted">
              <span>Livraison</span>
              <span>Calculé au checkout</span>
            </div>
            <div className="cart-sum-total">
              <span>Total estimé</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => navigate('/shop/checkout')}>
              Commander →
            </button>
            <Link to="/shop" className="cart-continue">Continuer mes achats</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
