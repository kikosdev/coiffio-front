import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { usePublicCartStore } from '../../store/publicCartStore'
import './ShopHomePage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function CartBadge() {
  const count = usePublicCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))
  const navigate = useNavigate()
  if (!count) return null
  return (
    <button className="sh-cart-badge" onClick={() => navigate('/shop/cart')}>
      <span className="sh-cart-icon">🛒</span>
      <span className="sh-cart-count">{count}</span>
      <span className="sh-cart-label">Panier</span>
    </button>
  )
}

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false)
  function handleAdd() {
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }
  return (
    <div className="sh-prod-card">
      <Link to={`/shop/product/${product._id}`} className="sh-prod-img-wrap">
        {product.imageUrl || (product.images && product.images[0]) ? (
          <img
            src={product.images?.[0] || product.imageUrl}
            alt={product.name}
            className="sh-prod-img"
          />
        ) : (
          <div className="sh-prod-img-placeholder">
            <span>{product.name[0]}</span>
          </div>
        )}
      </Link>
      <div className="sh-prod-body">
        <p className="sh-prod-eyebrow">{product.category}</p>
        <Link to={`/shop/product/${product._id}`} className="sh-prod-name">{product.name}</Link>
        {product.brand && <p className="sh-prod-brand">{product.brand}</p>}
        <p className="sh-prod-desc">{product.publicDescription || product.description}</p>
        <div className="sh-prod-foot">
          <span className="sh-prod-price">{product.priceEur?.toFixed(2)} €</span>
          <button
            className={`sh-prod-add${added ? ' added' : ''}`}
            onClick={handleAdd}
            disabled={added}
          >
            {added ? '✓ Ajouté' : '+ Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ShopHomePage() {
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('')
  const [page, setPage]           = useState(0)
  const [loading, setLoading]     = useState(true)
  const [categories, setCategories] = useState([])
  const addToCart = usePublicCartStore(s => s.add)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search)   params.search   = search
      if (category) params.category = category
      const res = await axios.get(`${API}/api/public/products`, { params })
      setProducts(res.data.items ?? [])
      setTotal(res.data.total ?? 0)
      if (!categories.length) {
        const cats = [...new Set((res.data.items ?? []).map(p => p.category))]
        setCategories(cats)
      }
    } catch { /* keep current */ }
    setLoading(false)
  }, [page, search, category])

  useEffect(() => { load() }, [load])

  function handleAdd(product) {
    addToCart({
      productId:   product._id,
      productName: product.name,
      unitPrice:   product.priceEur,
      image:       product.images?.[0] || product.imageUrl,
      quantity:    1,
    })
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="sh-page">
      <CartBadge />

      <header className="sh-header">
        <Link to="/" className="sh-back">← Retour</Link>
        <h1 className="sh-title">Boutique</h1>
        <p className="sh-subtitle">Nos produits professionnels, livrés chez vous</p>
      </header>

      <div className="sh-toolbar">
        <input
          className="sh-search"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        <div className="sh-cats">
          <button
            className={`sh-cat${!category ? ' active' : ''}`}
            onClick={() => { setCategory(''); setPage(0) }}
          >Tous</button>
          {categories.map(c => (
            <button
              key={c}
              className={`sh-cat${category === c ? ' active' : ''}`}
              onClick={() => { setCategory(c); setPage(0) }}
            >{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="sh-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="sh-skeleton"/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="sh-empty">
          <p>Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <>
          <div className="sh-grid">
            {products.map(p => (
              <ProductCard key={p._id} product={p} onAdd={handleAdd} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="sh-pagination">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
              <span>{page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
