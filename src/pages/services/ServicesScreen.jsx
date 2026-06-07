import { useState, useEffect, useRef } from 'react'
import SIcon from '../../components/SIcon'
import { useServiceStore, CATEGORY_LABELS, CATEGORY_COLORS } from '../../store/serviceStore'
import './ServicesScreen.css'

/* ── helpers ── */
const fmtDuration = (min) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${m.toString().padStart(2,'0')}` : `${h}h`
}

const margin = (price, cost) => {
  if (!cost || price <= 0) return null
  return Math.round(((price - cost) / price) * 100)
}

const ALL_CATEGORIES = ['HAIRCUT','COLORING','TREATMENT','STYLING','EXTENSIONS','BEARD','KIDS','OTHER']

/* ── Confirm dialog ── */
function ConfirmDialog({ title, body, onConfirm, onCancel, danger }) {
  return (
    <div className="svc-overlay" onClick={onCancel}>
      <div className="svc-confirm" onClick={e => e.stopPropagation()}>
        <div className="svc-confirm-icon">
          <SIcon name={danger ? 'triangle-alert' : 'circle-help'} size={24}/>
        </div>
        <div className="svc-confirm-title">{title}</div>
        {body && <div className="svc-confirm-body">{body}</div>}
        <div className="svc-confirm-actions">
          <button className="svc-btn svc-btn-ghost" onClick={onCancel}>Annuler</button>
          <button className={`svc-btn ${danger ? 'svc-btn-danger' : 'svc-btn-gold'}`} onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Kebab menu ── */
function KebabMenu({ onEdit, onToggle, onDelete, isActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="svc-kebab-wrap" ref={ref}>
      <button className="svc-kebab" onClick={e => { e.stopPropagation(); setOpen(v => !v) }}>
        <SIcon name="ellipsis-vertical" size={15}/>
      </button>
      {open && (
        <div className="svc-kebab-menu" onClick={e => e.stopPropagation()}>
          <button onClick={() => { setOpen(false); onEdit() }}>
            <SIcon name="pencil" size={13}/>Modifier
          </button>
          <button onClick={() => { setOpen(false); onToggle() }}>
            <SIcon name={isActive ? 'eye-off' : 'eye'} size={13}/>
            {isActive ? 'Désactiver' : 'Réactiver'}
          </button>
          <div className="svc-kebab-sep"/>
          <button className="danger" onClick={() => { setOpen(false); onDelete() }}>
            <SIcon name="trash-2" size={13}/>Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Service card ── */
function ServiceCard({ svc, onEdit, onToggle, onDelete, onClick }) {
  const m = margin(svc.price, svc.costPrice)
  const catColor = CATEGORY_COLORS[svc.category] || '#B89968'

  return (
    <div
      className={`svc-card ${!svc.isActive ? 'inactive' : ''}`}
      onClick={() => onClick(svc)}
    >
      <div className="svc-card-stripe" style={{ background: catColor }}/>
      <div className="svc-card-body">
        <div className="svc-card-top">
          <span className="svc-cat-pill" style={{ background: catColor + '22', color: catColor }}>
            {CATEGORY_LABELS[svc.category] || svc.category}
          </span>
          {!svc.isActive && <span className="svc-inactive-pill">Inactif</span>}
          <KebabMenu
            isActive={svc.isActive}
            onEdit={() => onEdit(svc)}
            onToggle={() => onToggle(svc)}
            onDelete={() => onDelete(svc)}
          />
        </div>
        <div className="svc-card-name">{svc.name}</div>
        {svc.description && <div className="svc-card-desc">{svc.description}</div>}
        <div className="svc-card-meta">
          <span><SIcon name="clock" size={12}/>{fmtDuration(svc.duration)}</span>
          <span><SIcon name="euro" size={12}/>{svc.price.toFixed(2)}</span>
          {m !== null && <span style={{ color: m >= 60 ? '#4A7C59' : m >= 30 ? '#B89968' : '#C25E5E' }}>
            <SIcon name="trending-up" size={12}/>{m}%
          </span>}
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ── */
function CardSkeleton() {
  return (
    <div className="svc-card svc-skeleton">
      <div className="svc-card-stripe" style={{ background: '#e4ddd4' }}/>
      <div className="svc-card-body">
        <div className="sk-line sk-sm"/>
        <div className="sk-line sk-lg" style={{ marginTop: 10 }}/>
        <div className="sk-line sk-md"/>
      </div>
    </div>
  )
}

/* ── Form modal ── */
const EMPTY_FORM = {
  name: '', category: 'HAIRCUT', description: '',
  duration: 30, price: '', costPrice: '',
  color: '#B89968', imageUrl: '',
  bufferBefore: 0, bufferAfter: 0,
  displayOrder: 0, isActive: true,
}

function ServiceFormModal({ initial, onSave, onClose, isSaving }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const isEdit = !!initial

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Minimum 2 caractères'
    if (!form.duration || form.duration < 5) e.duration = 'Minimum 5 min'
    if (form.price === '' || isNaN(form.price) || +form.price < 0) e.price = 'Prix invalide'
    if (form.color && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.color)) e.color = 'Hex invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(e) {
    e.preventDefault()
    if (!validate()) return
    const dto = {
      name:        form.name.trim(),
      category:    form.category,
      description: form.description.trim() || undefined,
      duration:    +form.duration,
      price:       +form.price,
      costPrice:   form.costPrice !== '' ? +form.costPrice : undefined,
      color:       form.color || undefined,
      bufferBefore: +form.bufferBefore,
      bufferAfter:  +form.bufferAfter,
      displayOrder: +form.displayOrder,
      isActive:    form.isActive,
    }
    onSave(dto)
  }

  return (
    <div className="svc-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <div className="svc-modal-title">
            {isEdit ? 'Modifier le service' : 'Nouveau service'}
          </div>
          <button className="svc-modal-close" onClick={onClose}>
            <SIcon name="x" size={16}/>
          </button>
        </div>
        <form className="svc-modal-body" onSubmit={submit}>
          {/* Section 1 — Identité */}
          <div className="svc-form-section-label">Identité</div>
          <div className="svc-form-row">
            <div className="svc-field" style={{ flex: 2 }}>
              <label>NOM DU SERVICE</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="ex. Coupe Femme"
              />
              {errors.name && <span className="svc-field-err">{errors.name}</span>}
            </div>
            <div className="svc-field" style={{ flex: 1 }}>
              <label>CATÉGORIE</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="svc-field">
            <label>DESCRIPTION <span className="svc-optional">optionnel</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Description courte du service (max 500 caractères)"
            />
          </div>

          {/* Section 2 — Tarification */}
          <div className="svc-form-section-label">Tarification</div>
          <div className="svc-form-row">
            <div className="svc-field">
              <label>PRIX CLIENT (€)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
              {errors.price && <span className="svc-field-err">{errors.price}</span>}
            </div>
            <div className="svc-field">
              <label>COÛT INTERNE (€) <span className="svc-optional">optionnel</span></label>
              <input
                type="number" min="0" step="0.01"
                value={form.costPrice}
                onChange={e => set('costPrice', e.target.value)}
              />
            </div>
            {form.price && form.costPrice && (
              <div className="svc-field svc-margin-preview">
                <label>MARGE</label>
                <div className="svc-margin-val">
                  {margin(+form.price, +form.costPrice) ?? '—'}%
                </div>
              </div>
            )}
          </div>

          {/* Section 3 — Planning */}
          <div className="svc-form-section-label">Planning</div>
          <div className="svc-form-row">
            <div className="svc-field">
              <label>DURÉE (min)</label>
              <input
                type="number" min="5" max="600"
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
              />
              {errors.duration && <span className="svc-field-err">{errors.duration}</span>}
            </div>
            <div className="svc-field">
              <label>TAMPON AVANT (min)</label>
              <input
                type="number" min="0"
                value={form.bufferBefore}
                onChange={e => set('bufferBefore', e.target.value)}
              />
            </div>
            <div className="svc-field">
              <label>TAMPON APRÈS (min)</label>
              <input
                type="number" min="0"
                value={form.bufferAfter}
                onChange={e => set('bufferAfter', e.target.value)}
              />
            </div>
          </div>

          {/* Section 4 — Apparence */}
          <div className="svc-form-section-label">Apparence</div>
          <div className="svc-form-row" style={{ alignItems: 'flex-end' }}>
            <div className="svc-field">
              <label>COULEUR (hex)</label>
              <div className="svc-color-row">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => set('color', e.target.value)}
                  className="svc-color-picker"
                />
                <input
                  value={form.color}
                  onChange={e => set('color', e.target.value)}
                  placeholder="#B89968"
                  style={{ flex: 1 }}
                />
              </div>
              {errors.color && <span className="svc-field-err">{errors.color}</span>}
            </div>
            <div className="svc-field" style={{ flex: 2 }}>
              <label>URL IMAGE <span className="svc-optional">optionnel</span></label>
              <input
                value={form.imageUrl}
                onChange={e => set('imageUrl', e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          {/* Section 5 — Autres */}
          <div className="svc-form-section-label">Autres</div>
          <div className="svc-form-row" style={{ alignItems: 'center' }}>
            <div className="svc-field" style={{ flex: 1 }}>
              <label>ORDRE D'AFFICHAGE</label>
              <input
                type="number" min="0"
                value={form.displayOrder}
                onChange={e => set('displayOrder', e.target.value)}
              />
            </div>
            <div className="svc-field svc-toggle-field">
              <label>SERVICE ACTIF</label>
              <button
                type="button"
                className={`svc-toggle ${form.isActive ? 'on' : ''}`}
                onClick={() => set('isActive', !form.isActive)}
              >
                <span className="svc-toggle-thumb"/>
              </button>
            </div>
          </div>
        </form>
        <div className="svc-modal-footer">
          <button className="svc-btn svc-btn-ghost" onClick={onClose}>Annuler</button>
          <button className="svc-btn svc-btn-gold" onClick={submit} disabled={isSaving}>
            {isSaving
              ? <><SIcon name="loader-circle" size={13}/> Enregistrement…</>
              : <><SIcon name="check" size={13}/> {isEdit ? 'Mettre à jour' : 'Créer le service'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Detail drawer ── */
function ServiceDetailDrawer({ svc, onClose, onEdit, onToggle, onDelete }) {
  const m = margin(svc.price, svc.costPrice)
  const catColor = CATEGORY_COLORS[svc.category] || '#B89968'

  return (
    <div className="svc-overlay svc-overlay-transparent" onClick={onClose}>
      <div className="svc-drawer" onClick={e => e.stopPropagation()}>
        <div className="svc-drawer-header" style={{ borderTop: `4px solid ${catColor}` }}>
          <div>
            <span className="svc-cat-pill" style={{ background: catColor + '22', color: catColor, marginBottom: 8, display:'inline-block' }}>
              {CATEGORY_LABELS[svc.category] || svc.category}
            </span>
            <div className="svc-drawer-title">{svc.name}</div>
          </div>
          <button className="svc-modal-close" onClick={onClose}><SIcon name="x" size={16}/></button>
        </div>

        <div className="svc-drawer-body">
          {svc.description && (
            <p className="svc-drawer-desc">{svc.description}</p>
          )}

          <div className="svc-drawer-stats">
            <div className="svc-drawer-stat">
              <span className="svc-drawer-stat-label">DURÉE</span>
              <span className="svc-drawer-stat-val">{fmtDuration(svc.duration)}</span>
            </div>
            <div className="svc-drawer-stat">
              <span className="svc-drawer-stat-label">PRIX</span>
              <span className="svc-drawer-stat-val">{svc.price.toFixed(2)} €</span>
            </div>
            {svc.costPrice != null && (
              <div className="svc-drawer-stat">
                <span className="svc-drawer-stat-label">COÛT</span>
                <span className="svc-drawer-stat-val">{svc.costPrice.toFixed(2)} €</span>
              </div>
            )}
            {m !== null && (
              <div className="svc-drawer-stat">
                <span className="svc-drawer-stat-label">MARGE</span>
                <span className="svc-drawer-stat-val" style={{ color: m >= 60 ? '#4A7C59' : m >= 30 ? '#B89968' : '#C25E5E' }}>
                  {m}%
                </span>
              </div>
            )}
          </div>

          {(svc.bufferBefore > 0 || svc.bufferAfter > 0) && (
            <div className="svc-drawer-row">
              <span className="svc-drawer-meta-label"><SIcon name="clock" size={12}/>Tampon</span>
              <span>avant {svc.bufferBefore} min · après {svc.bufferAfter} min</span>
            </div>
          )}

          <div className="svc-drawer-row">
            <span className="svc-drawer-meta-label"><SIcon name="circle-dot" size={12}/>Statut</span>
            <span style={{ color: svc.isActive ? '#4A7C59' : '#888' }}>
              {svc.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>

          <div className="svc-drawer-row">
            <span className="svc-drawer-meta-label"><SIcon name="hash" size={12}/>Ordre</span>
            <span>#{svc.displayOrder}</span>
          </div>
        </div>

        <div className="svc-drawer-footer">
          <button className="svc-btn svc-btn-ghost" onClick={() => { onDelete(svc); onClose() }}>
            <SIcon name="trash-2" size={13}/>Supprimer
          </button>
          <button className="svc-btn svc-btn-ghost" onClick={() => { onToggle(svc); onClose() }}>
            <SIcon name={svc.isActive ? 'eye-off' : 'eye'} size={13}/>
            {svc.isActive ? 'Désactiver' : 'Réactiver'}
          </button>
          <button className="svc-btn svc-btn-gold" onClick={() => { onEdit(svc); onClose() }}>
            <SIcon name="pencil" size={13}/>Modifier
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════════════ */

export default function ServicesScreen() {
  const {
    services, isLoading,
    filters, setFilter,
    fetchServices, createService, updateService, toggleService, deleteService,
  } = useServiceStore()

  const [formTarget, setFormTarget]       = useState(null)   // null = closed, {} = new, {...} = edit
  const [drawerSvc, setDrawerSvc]         = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [isSaving, setIsSaving]           = useState(false)
  const [toast, setToast]                 = useState(null)

  useEffect(() => { fetchServices() }, [])

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* filter */
  const displayed = services.filter(s => {
    if (!filters.showInactive && !s.isActive) return false
    if (filters.category && s.category !== filters.category) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      return s.name.toLowerCase().includes(q) ||
             (s.description || '').toLowerCase().includes(q)
    }
    return true
  })

  /* group by category */
  const grouped = ALL_CATEGORIES
    .map(cat => ({ cat, items: displayed.filter(s => s.category === cat) }))
    .filter(g => g.items.length > 0)

  /* actions */
  async function handleSave(dto) {
    setIsSaving(true)
    try {
      if (formTarget && formTarget._id) {
        await updateService(formTarget._id, dto)
        showToast('Service mis à jour.')
      } else {
        await createService(dto)
        showToast('Service créé.')
      }
      setFormTarget(null)
      fetchServices()
    } catch (e) {
      showToast(e.message || 'Erreur lors de l\'enregistrement.', 'err')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggle(svc) {
    try {
      await toggleService(svc._id)
      showToast(svc.isActive ? 'Service désactivé.' : 'Service réactivé.')
      fetchServices()
    } catch (e) {
      showToast(e.message || 'Erreur.', 'err')
    }
  }

  async function handleDelete(svc) {
    try {
      await deleteService(svc._id)
      showToast('Service supprimé.')
      fetchServices()
    } catch (e) {
      const is409 = e.status === 409
      showToast(
        is409
          ? 'Ce service est référencé par des RDV. Désactivez-le à la place.'
          : (e.message || 'Erreur lors de la suppression.'),
        'err'
      )
    }
    setConfirmDelete(null)
  }

  const totalActive   = services.filter(s => s.isActive).length
  const totalInactive = services.filter(s => !s.isActive).length

  return (
    <div className="sh-page svc-root">
      {/* ── Header ── */}
      <div className="svc-page-head">
        <div>
          <div className="sh-eyebrow">Catalogue</div>
          <h2 className="sh-serif svc-title">
            Gestion des <em>Services</em>
          </h2>
          <p className="svc-subtitle">
            {totalActive} service{totalActive !== 1 ? 's' : ''} actif{totalActive !== 1 ? 's' : ''}
            {totalInactive > 0 && <> · {totalInactive} inactif{totalInactive !== 1 ? 's' : ''}</>}
          </p>
        </div>
        <button className="svc-btn svc-btn-gold" onClick={() => setFormTarget({})}>
          <SIcon name="plus" size={14}/>Nouveau service
        </button>
      </div>

      <div className="sh-gold-rule"/>

      {/* ── Toolbar ── */}
      <div className="svc-toolbar">
        <div className="svc-search-wrap">
          <SIcon name="search" size={14}/>
          <input
            placeholder="Rechercher un service…"
            value={filters.search}
            onChange={e => { setFilter('search', e.target.value); fetchServices() }}
          />
          {filters.search && (
            <button className="svc-clear" onClick={() => { setFilter('search', ''); fetchServices() }}>
              <SIcon name="x" size={12}/>
            </button>
          )}
        </div>

        <div className="svc-cat-filters">
          <button
            className={`svc-cat-pill-btn ${!filters.category ? 'on' : ''}`}
            onClick={() => { setFilter('category', ''); fetchServices() }}
          >Tous</button>
          {ALL_CATEGORIES.map(c => (
            <button
              key={c}
              className={`svc-cat-pill-btn ${filters.category === c ? 'on' : ''}`}
              style={filters.category === c ? { background: CATEGORY_COLORS[c] + '22', color: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] + '66' } : {}}
              onClick={() => { setFilter('category', c); fetchServices() }}
            >{CATEGORY_LABELS[c]}</button>
          ))}
        </div>

        <button
          className={`svc-btn svc-btn-ghost svc-inactive-toggle ${filters.showInactive ? 'on' : ''}`}
          onClick={() => { setFilter('showInactive', !filters.showInactive) }}
        >
          <SIcon name={filters.showInactive ? 'eye' : 'eye-off'} size={13}/>
          {filters.showInactive ? 'Masquer inactifs' : 'Voir inactifs'}
        </button>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="svc-cat-section">
          <div className="svc-grid">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i}/>)}
          </div>
        </div>
      ) : grouped.length === 0 ? (
        <div className="svc-empty">
          <SIcon name="scissors" size={40}/>
          <div>Aucun service trouvé</div>
          <button className="svc-btn svc-btn-gold" onClick={() => setFormTarget({})}>
            <SIcon name="plus" size={14}/>Créer le premier service
          </button>
        </div>
      ) : (
        grouped.map(({ cat, items }) => (
          <div key={cat} className="svc-cat-section">
            <div className="svc-cat-heading">
              <div className="svc-cat-dot" style={{ background: CATEGORY_COLORS[cat] }}/>
              <span>{CATEGORY_LABELS[cat]}</span>
              <span className="svc-cat-count">{items.length}</span>
            </div>
            <div className="svc-grid">
              {items.map(svc => (
                <ServiceCard
                  key={svc._id}
                  svc={svc}
                  onClick={setDrawerSvc}
                  onEdit={setFormTarget}
                  onToggle={s => setConfirmToggle(s)}
                  onDelete={s => setConfirmDelete(s)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Modals ── */}
      {formTarget !== null && (
        <ServiceFormModal
          initial={formTarget._id ? formTarget : null}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
          isSaving={isSaving}
        />
      )}

      {drawerSvc && (
        <ServiceDetailDrawer
          svc={drawerSvc}
          onClose={() => setDrawerSvc(null)}
          onEdit={svc => { setDrawerSvc(null); setFormTarget(svc) }}
          onToggle={svc => { setDrawerSvc(null); setConfirmToggle(svc) }}
          onDelete={svc => { setDrawerSvc(null); setConfirmDelete(svc) }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          danger
          title={`Supprimer « ${confirmDelete.name} » ?`}
          body="Cette action est irréversible. Si des rendez-vous existent, vous serez invité à désactiver le service à la place."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmToggle && (
        <ConfirmDialog
          title={confirmToggle.isActive ? `Désactiver « ${confirmToggle.name} » ?` : `Réactiver « ${confirmToggle.name} » ?`}
          body={confirmToggle.isActive
            ? 'Le service sera masqué des nouvelles réservations.'
            : 'Le service sera à nouveau disponible à la réservation.'}
          onConfirm={() => { handleToggle(confirmToggle); setConfirmToggle(null) }}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`svc-toast ${toast.type}`}>
          <SIcon name={toast.type === 'err' ? 'triangle-alert' : 'circle-check'} size={14}/>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
