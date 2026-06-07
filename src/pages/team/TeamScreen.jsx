import { useState, useCallback } from 'react'
import SIcon from '../../components/SIcon'
import './TeamScreen.css'

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const ROLES_OPTIONS = ['Gérant(e)', 'Coiffeur / Styliste', 'Coloriste', 'Assistant(e)', 'Réceptionniste']

function makeHoraires() {
  return Object.fromEntries(
    DAYS_FR.map(d => [d, { active: d !== 'Dimanche', start:'09:00', end:'18:00', pauseStart:'13:00', pauseDur:60 }])
  )
}

const SEED_TEAM = [
  { id:1, nom:'Maria Galland', role:'OWNER',     color:'#b89968', initials:'MG', actif:true, horaires: makeHoraires() },
  { id:2, nom:'Léa Bernard',   role:'STYLIST',   color:'#4e7db5', initials:'LB', actif:true, horaires: makeHoraires() },
  { id:3, nom:'Marcus Dupont', role:'COLORIST',  color:'#b89968', initials:'MD', actif:true, horaires: makeHoraires() },
  { id:4, nom:'Sophie Martin', role:'ASSISTANT', color:'#6aaa64', initials:'SM', actif:true, horaires: makeHoraires() },
]

/* ═══════════════════════════════════════════════════════════
   ADD / EDIT COIFFEUR MODAL
═══════════════════════════════════════════════════════════ */

function CoiffeurModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    nom:      initial?.nom      || '',
    email:    initial?.email    || '',
    phone:    initial?.phone    || '',
    role:     initial?.role     || 'Coiffeur / Styliste',
    color:    initial?.color    || '#b89968',
    password: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    const parts = form.nom.trim().split(' ')
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
      : form.nom.slice(0,2).toUpperCase()
    onSave({
      ...initial,
      id:       initial?.id || Date.now(),
      nom:      form.nom,
      email:    form.email,
      phone:    form.phone,
      role:     form.role.toUpperCase().replace(/ \/ /g, '/'),
      color:    form.color,
      initials,
      actif:    true,
      horaires: initial?.horaires || makeHoraires(),
    })
    onClose()
  }

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-modal-card" onClick={e => e.stopPropagation()}>
        <form onSubmit={submit}>
          <div className="tm-modal-title">
            <em>{isEdit ? 'Modifier le Coiffeur' : 'Enregistrer un Coiffeur'}</em>
          </div>

          <div className="tm-form">
            <label className="tm-form-label">NOM COMPLET *
              <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Léa Bernard" required/>
            </label>
            <label className="tm-form-label">EMAIL PROFESSIONNEL *
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="lea@salon.com" required/>
            </label>
            <label className="tm-form-label">TÉLÉPHONE
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 00 00 00 00"/>
            </label>
            <label className="tm-form-label">RÔLE
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="tm-form-label">COULEUR DE CALENDRIER
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="tm-color-input"/>
            </label>
            {!isEdit && (
              <label className="tm-form-label">MOT DE PASSE INITIAL
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"/>
              </label>
            )}
          </div>

          <div className="tm-modal-foot">
            <button type="button" className="tm-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="sh-btn sh-btn-gold">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HORAIRES PANEL (right side)
═══════════════════════════════════════════════════════════ */

function HorairesPanel({ member, onSave, onDelete }) {
  const [horaires, setHoraires] = useState({ ...member.horaires })

  function toggle(day) {
    setHoraires(h => ({ ...h, [day]: { ...h[day], active: !h[day].active } }))
  }
  function setField(day, field, value) {
    setHoraires(h => ({ ...h, [day]: { ...h[day], [field]: value } }))
  }

  return (
    <div className="tm-horaires-panel">
      {/* Header */}
      <div className="tm-hor-header">
        <div>
          <div className="tm-hor-title">Horaires de {member.nom}</div>
          <div className="tm-hor-sub">Configuration des horaires et pauses de travail hebdomadaires.</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="sh-btn sh-btn-sm" onClick={() => onSave(horaires)}>Enregistrer</button>
          <button className="sh-btn sh-btn-sm sh-btn-danger" onClick={() => onDelete(member)}>Supprimer</button>
        </div>
      </div>

      {/* Days */}
      <div className="tm-hor-days">
        {DAYS_FR.map(day => {
          const h = horaires[day]
          return (
            <div key={day} className={'tm-hor-day' + (!h.active ? ' off' : '')}>
              <label className="tm-hor-check">
                <input
                  type="checkbox"
                  checked={h.active}
                  onChange={() => toggle(day)}
                />
                <span className="tm-hor-day-name">{day}</span>
              </label>

              {h.active ? (
                <div className="tm-hor-times">
                  <span className="tm-hor-label">Poste :</span>
                  <input className="tm-time-inp" type="time" value={h.start}      onChange={e => setField(day,'start',e.target.value)}/>
                  <span className="tm-hor-sep">-</span>
                  <input className="tm-time-inp" type="time" value={h.end}        onChange={e => setField(day,'end',e.target.value)}/>
                  <span className="tm-hor-label" style={{marginLeft:16}}>Pause :</span>
                  <input className="tm-time-inp" type="time" value={h.pauseStart} onChange={e => setField(day,'pauseStart',e.target.value)}/>
                  <input className="tm-dur-inp"  type="number" min={0} max={180} step={5} value={h.pauseDur} onChange={e => setField(day,'pauseDur',+e.target.value)}/>
                  <span className="tm-hor-label">m</span>
                </div>
              ) : (
                <span className="tm-hor-closed">Fermé / Congé</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DEMANDES DE CONGÉS TAB
═══════════════════════════════════════════════════════════ */

const CONGE_TYPES = ['Congé annuel', 'RTT', 'Maladie', 'Maternité / Paternité', 'Sans solde']

function CongesTab({ team }) {
  const [demandes, setDemandes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ membre:'', type:'Congé annuel', dateDebut:'', dateFin:'', motif:'' })
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  function submitDemande(e) {
    e.preventDefault()
    setDemandes(prev => [...prev, { ...form, id: Date.now(), status:'pending' }])
    setForm({ membre:'', type:'Congé annuel', dateDebut:'', dateFin:'', motif:'' })
    setShowModal(false)
  }

  function decide(id, status) {
    setDemandes(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  return (
    <div className="tm-conges-panel">
      <div className="sh-card tm-conges-card">
        <div className="tm-conges-head">
          <div>
            <div className="tm-hor-title" style={{fontSize:16}}>Demandes de congés &amp; absences</div>
            <div className="tm-hor-sub">Suivi des demandes d'absences de l'équipe.</div>
          </div>
          <button className="sh-btn sh-btn-gold" onClick={() => setShowModal(true)}>
            <SIcon name="plus" size={14}/>Faire une Demande
          </button>
        </div>

        {demandes.length === 0 ? (
          <div className="tm-conges-empty">Aucune demande de congé enregistrée.</div>
        ) : (
          <div className="tm-conges-list">
            {demandes.map(d => (
              <div key={d.id} className="tm-conges-row">
                <div className="tm-conges-info">
                  <span className="tm-conges-who">{d.membre}</span>
                  <span className="tm-conges-type">{d.type}</span>
                  <span className="tm-conges-dates">{d.dateDebut} → {d.dateFin}</span>
                  {d.motif && <span className="tm-conges-motif">{d.motif}</span>}
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  {d.status === 'pending' ? (
                    <>
                      <button className="tm-decline" onClick={() => decide(d.id,'refused')}>Refuser</button>
                      <button className="tm-approve" onClick={() => decide(d.id,'approved')}>Approuver</button>
                    </>
                  ) : (
                    <span className={'sh-cl-badge ' + (d.status === 'approved' ? 'completed' : 'pending')}>
                      {d.status === 'approved' ? 'Approuvé' : 'Refusé'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="tm-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal-card" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitDemande}>
              <div className="tm-modal-title"><em>Faire une Demande</em></div>
              <div className="tm-form">
                <label className="tm-form-label">MEMBRE
                  <select value={form.membre} onChange={e => set('membre', e.target.value)} required>
                    <option value="">— Sélectionner —</option>
                    {team.map(m => <option key={m.id}>{m.nom}</option>)}
                  </select>
                </label>
                <label className="tm-form-label">TYPE DE CONGÉ
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {CONGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <div className="tm-form-row">
                  <label className="tm-form-label">DATE DE DÉBUT
                    <input type="date" value={form.dateDebut} onChange={e => set('dateDebut',e.target.value)} required/>
                  </label>
                  <label className="tm-form-label">DATE DE FIN
                    <input type="date" value={form.dateFin} onChange={e => set('dateFin',e.target.value)} required/>
                  </label>
                </div>
                <label className="tm-form-label">MOTIF
                  <textarea value={form.motif} onChange={e => set('motif',e.target.value)} placeholder="Précisez le motif si nécessaire…" rows={2}/>
                </label>
              </div>
              <div className="tm-modal-foot">
                <button type="button" className="tm-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="sh-btn sh-btn-gold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEAM SCREEN ROOT
═══════════════════════════════════════════════════════════ */

export default function TeamScreen() {
  const [tab,      setTab]      = useState('membres')
  const [team,     setTeam]     = useState(SEED_TEAM)
  const [selected, setSelected] = useState(null)
  const [modal,    setModal]    = useState(null) // null | 'add' | member

  function saveMember(m) {
    setTeam(prev => prev.some(x => x.id === m.id)
      ? prev.map(x => x.id === m.id ? m : x)
      : [...prev, m]
    )
    setSelected(m)
  }

  function saveHoraires(horaires) {
    const updated = { ...selected, horaires }
    setTeam(prev => prev.map(m => m.id === selected.id ? updated : m))
    setSelected(updated)
  }

  function deleteMember(m) {
    if (!window.confirm(`Supprimer ${m.nom} de l'équipe ?`)) return
    setTeam(prev => prev.filter(x => x.id !== m.id))
    setSelected(null)
  }

  return (
    <div className="sh-page tm-page-new">
      {/* Tabs */}
      <div className="tm-tabs">
        <button className={'tm-tab' + (tab==='membres'?' active':'')} onClick={() => setTab('membres')}>
          Membres d'Équipe
        </button>
        <button className={'tm-tab' + (tab==='conges'?' active':'')} onClick={() => setTab('conges')}>
          Demandes de Congés
        </button>
      </div>

      {tab === 'membres' && (
        <div className="tm-membres-layout">
          {/* Left: list */}
          <div className="tm-membres-panel">
            <div className="sh-card tm-membres-card">
              <div className="tm-membres-head">
                <div>
                  <div className="tm-hor-title" style={{fontSize:16}}>L'Équipe du Salon</div>
                  <div className="tm-hor-sub">Gérez les fiches coiffeurs et leurs horaires hebdomadaires.</div>
                </div>
                <button className="sh-btn sh-btn-gold" onClick={() => setModal('add')}>
                  <SIcon name="plus" size={14}/>Ajouter un Coiffeur
                </button>
              </div>

              <div className="tm-membres-list">
                {team.map(m => (
                  <button
                    key={m.id}
                    className={'tm-membre-row' + (selected?.id === m.id ? ' active' : '')}
                    onClick={() => setSelected(m)}
                  >
                    <div className="tm-membre-av" style={{ background: m.color }}>{m.initials}</div>
                    <div className="tm-membre-info">
                      <span className="tm-membre-nom">{m.nom}</span>
                      <span className="tm-membre-role">{m.role}</span>
                    </div>
                    {m.actif && <span className="tm-actif-badge">Actif</span>}
                    <SIcon name="chevron-right" size={14} style={{color:'var(--muted)', flexShrink:0}}/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: horaires */}
          <div className="tm-horaires-wrap">
            {selected ? (
              <div className="sh-card" style={{overflow:'hidden'}}>
                <HorairesPanel
                  member={selected}
                  onSave={saveHoraires}
                  onDelete={deleteMember}
                />
              </div>
            ) : (
              <div className="sh-cl-empty">
                <SIcon name="users" size={38} style={{opacity:.22, marginBottom:14}}/>
                <p>Sélectionnez un coiffeur pour configurer ses horaires hebdomadaires.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'conges' && <CongesTab team={team}/>}

      {modal && (
        <CoiffeurModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveMember}
        />
      )}
    </div>
  )
}
