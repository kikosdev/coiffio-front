import { useState, useMemo } from 'react'
import SIcon from '../../components/SIcon'
import './StockScreen.css'

/* ─── Seed: fournisseurs ─── */
const SEED_FOURNISSEURS = [
  {
    id: 1,
    nom: "L'Oréal Professionnel",
    contact: 'Jean-Paul Mercier',
    tel: '+33 1 40 20 60 80',
    email: 'contact@lorealprofessionnel.fr',
    adresse: '41 Rue de Martre, Clichy, 92110',
    notes: 'Main luxury color and shampoo supplier.',
  },
]

/* ─── Seed: produits ─── */
const SEED_PRODUITS = [
  { id:1,  nom:'Kérastase Chronologiste Mask',        categorie:'Treatment',   prix:68, achat:30, qty:6,  alerte:5, barcode:'3474636976098', fournisseurId:1, notes:'' },
  { id:2,  nom:"Kérastase Elixir Ultime L'Huile",     categorie:'Styling',     prix:54, achat:22, qty:9,  alerte:5, barcode:'',              fournisseurId:1, notes:'' },
  { id:3,  nom:'Metal Detox Anti-Metal Cleansing Cream', categorie:'Treatment', prix:36, achat:14, qty:3,  alerte:5, barcode:'',             fournisseurId:1, notes:'' },
  { id:4,  nom:'Mythic Oil Original Oil',              categorie:'Styling',     prix:38, achat:15, qty:8,  alerte:5, barcode:'',              fournisseurId:1, notes:'' },
  { id:5,  nom:'Pro Longer Lengths Renewing Cream',    categorie:'Treatment',   prix:29, achat:11, qty:10, alerte:5, barcode:'',              fournisseurId:null, notes:'' },
  { id:6,  nom:'Steampod Serum Activated',             categorie:'Styling',     prix:42, achat:18, qty:7,  alerte:5, barcode:'',              fournisseurId:1, notes:'' },
  { id:7,  nom:'Série Expert Absolut Repair Conditioner', categorie:'Conditioner', prix:32, achat:13, qty:12, alerte:5, barcode:'',          fournisseurId:1, notes:'' },
  { id:8,  nom:'Série Expert Absolut Repair Shampoo',  categorie:'Shampoo',     prix:28, achat:11, qty:15, alerte:5, barcode:'',              fournisseurId:1, notes:'' },
  { id:9,  nom:'Série Expert Silver Shampoo',          categorie:'Shampoo',     prix:26, achat:10, qty:14, alerte:5, barcode:'',              fournisseurId:1, notes:'' },
  { id:10, nom:'Tecni.Art Savage Panache Hairspray',   categorie:'Styling',     prix:24, achat:9,  qty:2,  alerte:5, barcode:'',              fournisseurId:1, notes:'' },
]

const CATEGORIES = ['Shampoo', 'Conditioner', 'Treatment', 'Styling', 'Coloration', 'Soin', 'Autre']

function marge(prix, achat) {
  if (!achat || !prix) return null
  return Math.round(((prix - achat) / prix) * 100)
}

/* ─── Add/Edit Product modal ─── */
function ProduitModal({ initial, fournisseurs, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: initial?.nom ?? '',
    categorie: initial?.categorie ?? 'Shampoo',
    fournisseurId: initial?.fournisseurId ?? null,
    prix: initial?.prix ?? '',
    achat: initial?.achat ?? '',
    qty: initial?.qty ?? 10,
    alerte: initial?.alerte ?? 3,
    barcode: initial?.barcode ?? '',
    notes: initial?.notes ?? '',
  })
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function save(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.prix || !form.achat) return
    onSave({
      ...form,
      prix: parseFloat(form.prix),
      achat: parseFloat(form.achat),
      qty: parseInt(form.qty, 10),
      alerte: parseInt(form.alerte, 10),
      fournisseurId: form.fournisseurId ? parseInt(form.fournisseurId, 10) : null,
    })
    onClose()
  }

  return (
    <div className="stk-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="stk-modal">
        <h3 className="stk-modal-title">{initial ? 'Modifier le Produit' : 'Enregistrer un Produit'}</h3>
        <form className="stk-form" onSubmit={save}>
          <label className="stk-form-label">
            NOM DU PRODUIT *
            <input required placeholder="Série Expert Shampoo" value={form.nom} onChange={upd('nom')}/>
          </label>
          <div className="stk-form-row">
            <label className="stk-form-label">
              CATÉGORIE
              <select value={form.categorie} onChange={upd('categorie')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="stk-form-label">
              FOURNISSEUR
              <select value={form.fournisseurId ?? ''} onChange={upd('fournisseurId')}>
                <option value="">Aucun fournisseur…</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </label>
          </div>
          <div className="stk-form-row">
            <label className="stk-form-label">
              PRIX DE VENTE TTC *
              <input required type="number" min="0" step="0.01" placeholder="0 €" value={form.prix} onChange={upd('prix')}/>
            </label>
            <label className="stk-form-label">
              COÛT D'ACHAT HT *
              <input required type="number" min="0" step="0.01" placeholder="0 €" value={form.achat} onChange={upd('achat')}/>
            </label>
          </div>
          <div className="stk-form-row">
            <label className="stk-form-label">
              STOCK INITIAL
              <input type="number" min="0" value={form.qty} onChange={upd('qty')}/>
            </label>
            <label className="stk-form-label">
              ALERTE STOCK BAS
              <input type="number" min="0" value={form.alerte} onChange={upd('alerte')}/>
            </label>
          </div>
          <label className="stk-form-label">
            CODE-BARRES / BARCODE
            <input placeholder="EAN-13 code" value={form.barcode} onChange={upd('barcode')}/>
          </label>
          <label className="stk-form-label">
            NOTES DE DESCRIPTION
            <textarea rows={2} placeholder="Usage professionnel ou revente…" value={form.notes} onChange={upd('notes')}/>
          </label>
          <div className="stk-modal-foot">
            <button type="button" className="stk-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="sh-btn sh-btn-gold">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Add Supplier modal ─── */
function FournisseurModal({ onClose, onSave }) {
  const [form, setForm] = useState({ nom:'', contact:'', tel:'', email:'', adresse:'', notes:'' })
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function save(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onSave({ ...form })
    onClose()
  }

  return (
    <div className="stk-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="stk-modal">
        <h3 className="stk-modal-title">Ajouter un Fournisseur</h3>
        <form className="stk-form" onSubmit={save}>
          <label className="stk-form-label">
            NOM DE LA SOCIÉTÉ *
            <input required placeholder="L'Oréal Professionnel" value={form.nom} onChange={upd('nom')}/>
          </label>
          <label className="stk-form-label">
            CONTACT (NOM COMPLET)
            <input placeholder="M. Jean-Paul Mercier" value={form.contact} onChange={upd('contact')}/>
          </label>
          <label className="stk-form-label">
            TÉLÉPHONE
            <input placeholder="+33 1 00 00 00 00" value={form.tel} onChange={upd('tel')}/>
          </label>
          <label className="stk-form-label">
            EMAIL
            <input type="email" placeholder="contact@loreal.fr" value={form.email} onChange={upd('email')}/>
          </label>
          <label className="stk-form-label">
            ADRESSE PHYSIQUE
            <input placeholder="Paris, France" value={form.adresse} onChange={upd('adresse')}/>
          </label>
          <label className="stk-form-label">
            NOTES LOGISTIQUES
            <textarea rows={2} placeholder="Livraison le jeudi. Délai 48h." value={form.notes} onChange={upd('notes')}/>
          </label>
          <div className="stk-modal-foot">
            <button type="button" className="stk-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="sh-btn sh-btn-gold">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Product detail panel ─── */
function ProduitDetail({ produit, fournisseurs, onAjuster, onSupprimer }) {
  const f = fournisseurs.find(f => f.id === produit.fournisseurId)
  const m = marge(produit.prix, produit.achat)
  return (
    <div className="stk-detail-card stk-card">
      <div className="stk-detail-head">
        <div className="stk-detail-heading">Détails du Produit</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="sh-btn" onClick={onAjuster}>Ajuster</button>
          <button className="sh-btn stk-btn-danger" onClick={onSupprimer}>Supprimer</button>
        </div>
      </div>
      <div className="stk-detail-body">
        <div className="stk-detail-name">{produit.nom}</div>
        <div className="stk-detail-meta">
          Catégorie : {produit.categorie}
          {produit.barcode && <> · Barcode : {produit.barcode}</>}
        </div>
        <div className="stk-detail-stats">
          <div className="stk-detail-stat">
            <div className="stk-stat-lbl">PRIX DE VENTE</div>
            <div className="stk-stat-val">{produit.prix} €</div>
          </div>
          <div className="stk-detail-stat">
            <div className="stk-stat-lbl">COÛT D'ACHAT</div>
            <div className="stk-stat-val">{produit.achat} €</div>
          </div>
          <div className="stk-detail-stat">
            <div className="stk-stat-lbl">MARGE BRUT</div>
            <div className="stk-stat-val stk-stat-marge">{m !== null ? `${m}%` : '—'}</div>
          </div>
        </div>
        {f && (
          <div className="stk-detail-fourn">
            <span className="stk-detail-fourn-lbl">Fournisseur :</span>
            <span className="stk-detail-fourn-val">{f.nom}</span>
          </div>
        )}
        <div className="stk-detail-journal-title">Journal d&apos;audit du stock</div>
        <div className="stk-detail-journal-empty">Aucun mouvement enregistré.</div>
      </div>
    </div>
  )
}

/* ─── Produits tab ─── */
function ProduitsTab() {
  const [produits, setProduits]     = useState(SEED_PRODUITS)
  const [fournisseurs]              = useState(SEED_FOURNISSEURS)
  const [selected, setSelected]     = useState(null)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(null) // null | 'add' | produit

  const filtered = useMemo(() =>
    produits
      .filter(p => p.nom.toLowerCase().includes(search.toLowerCase()) || p.categorie.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.nom.localeCompare(b.nom))
  , [produits, search])

  function saveModal(data) {
    if (modal === 'add') {
      setProduits(p => [...p, { ...data, id: Date.now() }])
    } else {
      setProduits(p => p.map(x => x.id === modal.id ? { ...x, ...data } : x))
      setSelected(prev => prev?.id === modal.id ? { ...prev, ...data } : prev)
    }
  }

  function adjustQty(id, delta) {
    setProduits(p => p.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x))
    if (selected?.id === id) setSelected(prev => ({ ...prev, qty: Math.max(0, prev.qty + delta) }))
  }

  function deleteProduit(id) {
    setProduits(p => p.filter(x => x.id !== id))
    setSelected(null)
  }

  const selectedFull = produits.find(p => p.id === selected?.id) ?? null

  return (
    <div className="stk-layout">
      {/* Left: inventory list */}
      <div className="stk-card stk-list-card">
        <div className="stk-list-head">
          <div>
            <div className="stk-list-title">Inventaire des Produits</div>
            <div className="stk-list-sub">Suivi des niveaux de stock et alertes d&apos;approvisionnement.</div>
          </div>
          <button className="sh-btn sh-btn-gold" onClick={() => setModal('add')}>
            <SIcon name="plus" size={13}/>Ajouter Produit
          </button>
        </div>
        <div className="stk-search">
          <SIcon name="search" size={14}/>
          <input placeholder="Rechercher par nom, catégorie…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="stk-list">
          {filtered.map(p => {
            const low = p.qty <= p.alerte
            const isActive = selectedFull?.id === p.id
            return (
              <div key={p.id} className={['stk-row', isActive && 'active', low && 'low'].filter(Boolean).join(' ')}
                onClick={() => setSelected(p)}>
                <div className="stk-row-icon"><SIcon name="box" size={16}/></div>
                <div className="stk-row-info">
                  <div className="stk-row-nom">{p.nom}</div>
                  <div className="stk-row-meta">{p.categorie} · Prix : {p.prix} €</div>
                </div>
                <div className="stk-row-qty">
                  <button className="stk-qty-btn" onClick={e => { e.stopPropagation(); adjustQty(p.id, -1) }}>−</button>
                  <span className={['stk-qty-num', low && 'low'].filter(Boolean).join(' ')}>{p.qty}</span>
                  <button className="stk-qty-btn" onClick={e => { e.stopPropagation(); adjustQty(p.id, +1) }}>+</button>
                </div>
                <div className="stk-row-chevron"><SIcon name="chevron-right" size={14}/></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: detail panel */}
      <div className="stk-detail-wrap">
        {selectedFull
          ? <ProduitDetail
              produit={selectedFull}
              fournisseurs={fournisseurs}
              onAjuster={() => setModal(selectedFull)}
              onSupprimer={() => deleteProduit(selectedFull.id)}
            />
          : <div className="stk-card stk-empty-panel">
              <SIcon name="box" size={40}/>
              <p>Sélectionnez un produit de la liste pour voir ses analyses de marge financière et le journal de mouvements de stock.</p>
            </div>
        }
      </div>

      {modal && (
        <ProduitModal
          initial={modal === 'add' ? null : modal}
          fournisseurs={fournisseurs}
          onClose={() => setModal(null)}
          onSave={saveModal}
        />
      )}
    </div>
  )
}

/* ─── Supplier detail panel ─── */
function FournisseurDetail({ f, onSupprimer }) {
  return (
    <div className="stk-card stk-fourn-detail">
      <div className="stk-detail-head">
        <div className="stk-detail-heading">Fiche Fournisseur</div>
        <button className="sh-btn stk-btn-danger" onClick={onSupprimer}>Supprimer</button>
      </div>
      <div className="stk-fourn-body">
        <div className="stk-fourn-name">{f.nom}</div>
        {f.contact  && <div className="stk-fourn-row"><span>Contact :</span><strong>{f.contact}</strong></div>}
        {f.tel      && <div className="stk-fourn-row"><span>Téléphone :</span><strong>{f.tel}</strong></div>}
        {f.email    && <div className="stk-fourn-row"><span>Email :</span><strong>{f.email}</strong></div>}
        {f.adresse  && <div className="stk-fourn-row"><span>Adresse :</span><strong>{f.adresse}</strong></div>}
        {f.notes    && <div className="stk-fourn-notes">Notes : &ldquo;{f.notes}&rdquo;</div>}
      </div>
    </div>
  )
}

/* ─── Fournisseurs tab ─── */
function FournisseursTab() {
  const [fournisseurs, setFournisseurs] = useState(SEED_FOURNISSEURS)
  const [selected, setSelected]         = useState(fournisseurs[0] ?? null)
  const [modal, setModal]               = useState(false)

  function addF(data) {
    const f = { ...data, id: Date.now() }
    setFournisseurs(p => [...p, f])
    setSelected(f)
  }
  function deleteF(id) {
    const next = fournisseurs.filter(f => f.id !== id)
    setFournisseurs(next)
    setSelected(next[0] ?? null)
  }

  const selectedFull = fournisseurs.find(f => f.id === selected?.id) ?? null

  return (
    <div className="stk-layout">
      {/* Left */}
      <div className="stk-card stk-list-card">
        <div className="stk-list-head">
          <div>
            <div className="stk-list-title">Fournisseurs Enregistrés</div>
            <div className="stk-list-sub">Coordonnées de vos partenaires logistiques.</div>
          </div>
          <button className="sh-btn sh-btn-gold" onClick={() => setModal(true)}>
            <SIcon name="plus" size={13}/>Ajouter Fournisseur
          </button>
        </div>
        <div className="stk-fourn-list">
          {fournisseurs.length === 0 && (
            <div className="stk-fourn-empty">Aucun fournisseur enregistré.</div>
          )}
          {fournisseurs.map(f => (
            <div key={f.id} className={['stk-fourn-row-item', selectedFull?.id === f.id && 'active'].filter(Boolean).join(' ')}
              onClick={() => setSelected(f)}>
              <span className="stk-fourn-row-nom">{f.nom}</span>
              <SIcon name="chevron-right" size={14}/>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="stk-detail-wrap">
        {selectedFull
          ? <FournisseurDetail f={selectedFull} onSupprimer={() => deleteF(selectedFull.id)}/>
          : <div className="stk-card stk-empty-panel">
              <SIcon name="truck" size={36}/>
              <p>Sélectionnez un fournisseur pour voir sa fiche.</p>
            </div>
        }
      </div>

      {modal && <FournisseurModal onClose={() => setModal(false)} onSave={addF}/>}
    </div>
  )
}

/* ─── Root ─── */
const TABS = ['Produits de Revente', 'Fournisseurs (Catalog)']

export default function StockScreen() {
  const [tab, setTab] = useState(0)
  return (
    <div className="sh-page stk-page">
      <div className="stk-tabs">
        {TABS.map((t, i) => (
          <button key={t} className={'stk-tab' + (tab === i ? ' active' : '')} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <ProduitsTab/>}
      {tab === 1 && <FournisseursTab/>}
    </div>
  )
}
