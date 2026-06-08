import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { usePublicCartStore } from '../../store/publicCartStore'
import './ProductDetailPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ProductDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [added, setAdded]     = useState(false)
  const addToCart = usePublicCartStore(s => s.add)

  useEffect(() => {
    axios.get(`${API}/api/public/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="pd-loading">Chargement…</div>
  if (!product) return null

  const images = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : [])

  function handleAdd() {
    addToCart({
      productId:   product._id,
      productName: product.name,
      unitPrice:   product.priceEur,
      image:       images[0],
      quantity:    qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="pd-page">
      <div className="pd-inner">
        <Link to="/shop" className="pd-back">← Boutique</Link>

        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            {images.length ? (
              <img src={images[0]} alt={product.name} className="pd-img" />
            ) : (
              <div className="pd-img-placeholder">{product.name[0]}</div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <p className="pd-eyebrow">{product.category}</p>
            <h1 className="pd-name">{product.name}</h1>
            {product.brand && <p className="pd-brand">{product.brand}</p>}
            <p className="pd-price">{product.priceEur?.toFixed(2)} €</p>

            <p className="pd-desc">
              {product.publicDescription || product.description}
            </p>

            <div className="pd-qty-row">
              <span className="pd-qty-label">Quantité</span>
              <div className="pd-stepper">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
              </div>
              <span className="pd-stock">
                {product.stockQuantity > 0 ? `${product.stockQuantity} en stock` : 'Rupture de stock'}
              </span>
            </div>

            <button
              className={`pd-cta${added ? ' added' : ''}`}
              onClick={handleAdd}
              disabled={product.stockQuantity === 0}
            >
              {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
            </button>

            <Link to="/shop/cart" className="pd-view-cart">Voir le panier →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
