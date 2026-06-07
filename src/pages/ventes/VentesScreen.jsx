import { useState, useMemo } from 'react'
import SIcon from '../../components/SIcon'
import './VentesScreen.css'

/* ─── Shared product catalog (mirrors StockScreen seed) ─── */
const CATALOG = [
  { id:1,  nom:'Kérastase Chronologiste Mask',          categorie:'Treatment',   prix:68 },
  { id:2,  nom:"Kérastase Elixir Ultime L'Huile",       categorie:'Styling',     prix:54 },
  { id:3,  nom:'Metal Detox Anti-Metal Cleansing Cream', categorie:'Treatment',  prix:36 },
  { id:4,  nom:'Mythic Oil Original Oil',                categorie:'Styling',    prix:38 },
  { id:5,  nom:'Pro Longer Lengths Renewing Cream',      categorie:'Treatment',  prix:29 },
  { id:6,  nom:'Steampod Serum Activated',               categorie:'Styling',    prix:42 },
  { id:7,  nom:'Série Expert Absolut Repair Conditioner',categorie:'Conditioner',prix:32 },
  { id:8,  nom:'Série Expert Absolut Repair Shampoo',    categorie:'Shampoo',    prix:28 },
  { id:9,  nom:'Série Expert Silver Shampoo',            categorie:'Shampoo',    prix:26 },
  { id:10, nom:'Tecni.Art Savage Panache Hairspray',     categorie:'Styling',    prix:24 },
]

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function fmtEur(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'
}

/* ─── Caisse Directe modal ─── */
function CaisseModal({ onClose, onTicket }) {
  const [cart, setCart]       = useState([])   // [{id, nom, prix, qty}]
  const [search, setSearch]   = useState('')
  const [methode, setMethode] = useState('carte') // 'carte' | 'especes'
  const [remise, setRemise]   = useState('')

  const filtered = useMemo(() =>
    CATALOG.filter(p =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
    ), [search])

  function addToCart(prod) {
    setCart(prev => {
      const existing = prev.find(x => x.id === prod.id)
      if (existing) return prev.map(x => x.id === prod.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...prod, qty: 1 }]
    })
  }

  function setQty(id, val) {
    const q = Math.max(0, parseInt(val, 10) || 0)
    setCart(prev => q === 0 ? prev.filter(x => x.id !== id) : prev.map(x => x.id === id ? { ...x, qty: q } : x))
  }

  const subtotal  = cart.reduce((s, x) => s + x.prix * x.qty, 0)
  const remiseAmt = parseFloat(remise) || 0
  const total     = Math.max(0, subtotal - remiseAmt)

  function encaisser() {
    if (cart.length === 0) return
    onTicket({
      id: Date.now(),
      date: new Date().toISOString(),
      lignes: cart.map(x => ({ ...x })),
      methode,
      remise: remiseAmt,
      total,
    })
    onClose()
  }

  return (
    <div className="vt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="vt-caisse-modal">
        {/* Header */}
        <div className="vt-caisse-header">
          <div>
            <div className="vt-caisse-title">Caisse Directe</div>
            <div className="vt-caisse-sub">Sélectionnez les produits à encaisser</div>
          </div>
          <button className="vt-close-btn" onClick={onClose}><SIcon name="x" size={18}/></button>
        </div>

        <div className="vt-caisse-body">
          {/* Left: catalog */}
          <div className="vt-caisse-left">
            <div className="vt-caisse-search">
              <SIcon name="search" size={14}/>
              <input placeholder="Rechercher un produit…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="vt-prod-grid">
              {filtered.map(p => {
                const inCart = cart.find(x => x.id === p.id)
                return (
                  <button key={p.id} className={['vt-prod-card', inCart && 'in-cart'].filter(Boolean).join(' ')}
                    onClick={() => addToCart(p)}>
                    {inCart && <span className="vt-prod-badge">{inCart.qty}</span>}
                    <div className="vt-prod-icon"><SIcon name="box" size={22}/></div>
                    <div className="vt-prod-nom">{p.nom}</div>
                    <div className="vt-prod-cat">{p.categorie}</div>
                    <div className="vt-prod-prix">{p.prix} €</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: cart + payment */}
          <div className="vt-caisse-right">
            <div className="vt-cart-title">Panier</div>

            {cart.length === 0
              ? <div className="vt-cart-empty">Aucun article sélectionné.</div>
              : <div className="vt-cart-list">
                  {cart.map(x => (
                    <div key={x.id} className="vt-cart-row">
                      <div className="vt-cart-info">
                        <div className="vt-cart-nom">{x.nom}</div>
                        <div className="vt-cart-uprice">{x.prix} € / unité</div>
                      </div>
                      <div className="vt-cart-controls">
                        <button className="vt-qbtn" onClick={() => setQty(x.id, x.qty - 1)}>−</button>
                        <span className="vt-qnum">{x.qty}</span>
                        <button className="vt-qbtn" onClick={() => setQty(x.id, x.qty + 1)}>+</button>
                      </div>
                      <div className="vt-cart-total">{fmtEur(x.prix * x.qty)}</div>
                    </div>
                  ))}
                </div>
            }

            <div className="vt-cart-sep"/>

            {/* Remise */}
            <div className="vt-remise-row">
              <span className="vt-remise-lbl">Remise (€)</span>
              <input className="vt-remise-inp" type="number" min="0" placeholder="0" value={remise} onChange={e => setRemise(e.target.value)}/>
            </div>

            {/* Payment method */}
            <div className="vt-methode-label">MODE DE PAIEMENT</div>
            <div className="vt-methode-pills">
              <button className={['vt-methode-btn', methode === 'carte' && 'active'].filter(Boolean).join(' ')}
                onClick={() => setMethode('carte')}>
                <SIcon name="credit-card" size={14}/>Carte Bancaire
              </button>
              <button className={['vt-methode-btn', methode === 'especes' && 'active'].filter(Boolean).join(' ')}
                onClick={() => setMethode('especes')}>
                <SIcon name="banknote" size={14}/>Espèces
              </button>
            </div>

            {/* Total */}
            <div className="vt-total-row">
              <span>Sous-total</span><span>{fmtEur(subtotal)}</span>
            </div>
            {remiseAmt > 0 && (
              <div className="vt-total-row vt-remise-line">
                <span>Remise</span><span>− {fmtEur(remiseAmt)}</span>
              </div>
            )}
            <div className="vt-total-row vt-total-final">
              <span>Total TTC</span><span>{fmtEur(total)}</span>
            </div>

            <button className="vt-encaisser-btn" disabled={cart.length === 0} onClick={encaisser}>
              <SIcon name="check" size={16}/>Encaisser {cart.length > 0 && fmtEur(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Palmarès: top products from tickets ─── */
function Palmares({ tickets }) {
  const tally = useMemo(() => {
    const map = {}
    tickets.forEach(t => t.lignes.forEach(l => {
      if (!map[l.nom]) map[l.nom] = { nom: l.nom, qty: 0, ca: 0 }
      map[l.nom].qty += l.qty
      map[l.nom].ca  += l.prix * l.qty
    }))
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10)
  }, [tickets])

  if (tally.length === 0) return (
    <div className="vt-pal-empty">Aucune vente directe enregistrée.</div>
  )
  return (
    <div className="vt-pal-list">
      {tally.map((item, i) => (
        <div key={item.nom} className="vt-pal-row">
          <span className="vt-pal-rank">#{i + 1}</span>
          <span className="vt-pal-nom">{item.nom}</span>
          <span className="vt-pal-qty">{item.qty} vendu{item.qty > 1 ? 's' : ''}</span>
          <span className="vt-pal-ca">{fmtEur(item.ca)}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Root screen ─── */
export default function VentesScreen() {
  const [tickets, setTickets] = useState([])
  const [caisse, setCaisse]   = useState(false)

  const totalCA    = tickets.reduce((s, t) => s + t.total, 0)
  const totalCarte = tickets.filter(t => t.methode === 'carte').reduce((s, t) => s + t.total, 0)
  const totalEsp   = tickets.filter(t => t.methode === 'especes').reduce((s, t) => s + t.total, 0)

  return (
    <div className="sh-page vt-page">
      {/* Page header */}
      <div className="vt-page-head">
        <div>
          <h2 className="vt-page-title">Ventes de Produits</h2>
          <p className="vt-page-sub">Enregistrez les ventes de rechange directes et visualisez vos best-sellers.</p>
        </div>
        <button className="sh-btn sh-btn-gold" onClick={() => setCaisse(true)}>
          <SIcon name="shopping-bag" size={14}/>Caisse Directe (Vente)
        </button>
      </div>

      <div className="vt-sep"/>

      {/* Top row: CA + Palmarès */}
      <div className="vt-top-row">
        {/* CA card */}
        <div className="vt-card vt-ca-card">
          <div className="vt-card-head">
            <div className="vt-card-title">CA Ventes Directes</div>
            <div className="vt-card-sub">Chiffre d&apos;affaires de produits revente cumulé ce mois-ci.</div>
          </div>
          <div className="vt-ca-body">
            <div className="vt-ca-eyebrow">CHIFFRE DE REVENTE</div>
            <div className="vt-ca-amount">
              <span className="vt-ca-num">{totalCA === 0 ? '0' : totalCA.toLocaleString('fr-FR')}</span>
              <span className="vt-ca-cur"> €</span>
            </div>
            <div className="vt-ca-stats">
              <div className="vt-ca-stat-row">
                <span>Nombre de tickets :</span>
                <strong>{tickets.length} vente{tickets.length !== 1 ? 's' : ''}</strong>
              </div>
              <div className="vt-ca-stat-row">
                <span>CA Carte Bancaire :</span>
                <strong>{fmtEur(totalCarte)}</strong>
              </div>
              <div className="vt-ca-stat-row">
                <span>CA Espèces :</span>
                <strong>{fmtEur(totalEsp)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Palmarès card */}
        <div className="vt-card vt-pal-card">
          <div className="vt-card-head">
            <div className="vt-card-title">Palmarès des ventes (Produits)</div>
            <div className="vt-card-sub">Les 10 articles les plus vendus de la période.</div>
          </div>
          <Palmares tickets={tickets}/>
        </div>
      </div>

      {/* Tickets list */}
      <div className="vt-card vt-tickets-card">
        <div className="vt-card-head">
          <div className="vt-card-title">Tickets de Vente Directe</div>
          <div className="vt-card-sub">Historique des règlements au comptoir.</div>
        </div>
        {tickets.length === 0
          ? <div className="vt-tickets-empty">Aucun ticket émis.</div>
          : <div className="vt-tickets-list">
              {[...tickets].reverse().map(t => (
                <div key={t.id} className="vt-ticket-row">
                  <div className="vt-ticket-left">
                    <div className="vt-ticket-date">{fmtDate(t.date)}</div>
                    <div className="vt-ticket-items">
                      {t.lignes.map(l => `${l.nom} ×${l.qty}`).join(' · ')}
                    </div>
                  </div>
                  <div className="vt-ticket-right">
                    <span className={['vt-methode-tag', t.methode].filter(Boolean).join(' ')}>
                      {t.methode === 'carte' ? 'Carte' : 'Espèces'}
                    </span>
                    {t.remise > 0 && <span className="vt-remise-tag">−{fmtEur(t.remise)}</span>}
                    <span className="vt-ticket-total">{fmtEur(t.total)}</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {caisse && (
        <CaisseModal
          onClose={() => setCaisse(false)}
          onTicket={t => setTickets(prev => [...prev, t])}
        />
      )}
    </div>
  )
}
