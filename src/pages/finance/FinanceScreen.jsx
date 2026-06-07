import { useState } from 'react'
import SIcon from '../../components/SIcon'
import './FinanceScreen.css'

/* ─── Helpers ─── */
const PERIODS = ['Jour', 'Semaine', 'Mois', 'Année']
const TABS    = ['Analyses & CA', 'Paiements Reçus', 'Frais & Dépenses']

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function getPeriodRange(period) {
  const now = new Date()
  let start, end
  if (period === 'Jour') {
    start = end = new Date(now)
  } else if (period === 'Semaine') {
    const day = now.getDay()
    start = new Date(now); start.setDate(now.getDate() - day)
    end   = new Date(start); end.setDate(start.getDate() + 6)
  } else if (period === 'Mois') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else {
    start = new Date(now.getFullYear(), 0, 1)
    end   = new Date(now.getFullYear(), 11, 31)
  }
  const fmt = d => d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
  return { label:`Du ${fmt(start)} au ${fmt(end)}`, start, end }
}

/* ─── Seed data ─── */
const SEED_FRAIS = [
  { id:1, titre:'Rent',            desc:'Monthly rent for the salon space',      date:'2026-05-25', montant:1200 },
  { id:2, titre:'Products Supply', desc:"Order from L'Oréal (Invoice #2983)",   date:'2026-05-25', montant:450  },
  { id:3, titre:'Utilities',       desc:'Electricity & water bill',              date:'2026-05-25', montant:180  },
]

/* ─── Declare expense modal ─── */
function FraisModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ titre:'', montant:'', desc:'' })
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function save() {
    if (!form.titre.trim() || !form.montant) return
    onAdd({ titre: form.titre.trim(), montant: parseFloat(form.montant), desc: form.desc.trim(), date: new Date().toISOString().slice(0,10) })
    onClose()
  }

  return (
    <div className="fin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fin-modal">
        <h3 className="fin-modal-title">Déclarer un Frais</h3>
        <div className="fin-form">
          <label className="fin-form-label">
            INTITULÉ DU FRAIS *
            <input placeholder="Ex: Loyer, fournitures…" value={form.titre} onChange={upd('titre')}/>
          </label>
          <label className="fin-form-label">
            MONTANT (€) *
            <input type="number" min="0" step="0.01" placeholder="0,00" value={form.montant} onChange={upd('montant')}/>
          </label>
          <label className="fin-form-label">
            DESCRIPTION / NOTE
            <textarea rows={3} placeholder="Détails optionnels…" value={form.desc} onChange={upd('desc')}/>
          </label>
        </div>
        <div className="fin-modal-foot">
          <button className="fin-cancel" onClick={onClose}>Annuler</button>
          <button className="sh-btn sh-btn-gold" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 1: Analyses & CA ─── */
function AnalysesTab({ period }) {
  const { label } = getPeriodRange(period)
  return (
    <div className="fin-analyses">
      {/* CA Hero */}
      <div className="fin-card fin-ca-hero">
        <div className="fin-ca-eyebrow">CHIFFRE D&apos;AFFAIRES DE LA PÉRIODE</div>
        <div className="fin-ca-amount">
          <span className="fin-ca-num">0</span>
          <span className="fin-ca-cur"> €</span>
        </div>
        <div className="fin-ca-sub">{label} · <strong>0</strong> encaissements au total.</div>
      </div>

      {/* Daily revenue chart */}
      <div className="fin-card">
        <div className="fin-card-head">
          <div className="fin-card-title">Recettes au cours de la période</div>
          <div className="fin-card-sub">Chiffre d&apos;affaires agrégé par jour (EUR)</div>
        </div>
        <div className="fin-chart-placeholder"/>
      </div>

      {/* Bottom 2-col */}
      <div className="fin-two-col">
        <div className="fin-card">
          <div className="fin-card-head">
            <div className="fin-card-title">CA par Coiffeur</div>
            <div className="fin-card-sub">Répartition du chiffre d&apos;affaires généré par collaborateur.</div>
          </div>
          <div className="fin-chart-placeholder fin-chart-sm"/>
        </div>
        <div className="fin-card">
          <div className="fin-card-head">
            <div className="fin-card-title">Méthodes de Paiement</div>
            <div className="fin-card-sub">Proportions des modes d&apos;encaissement de la période.</div>
          </div>
          <div className="fin-method-empty">Aucun encaissement</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 2: Paiements Reçus ─── */
function PaiementsTab() {
  const paiements = []
  return (
    <div className="fin-card">
      <div className="fin-card-head">
        <div className="fin-card-title">Reçus de Paiement</div>
        <div className="fin-card-sub">Liste chronologique des règlements perçus.</div>
      </div>
      {paiements.length === 0
        ? <div className="fin-pay-empty">Aucun paiement enregistré pour cette période.</div>
        : <div className="fin-pay-list">
            {paiements.map(p => (
              <div key={p.id} className="fin-pay-row">
                <div className="fin-pay-info">
                  <div className="fin-pay-client">{p.client}</div>
                  <div className="fin-pay-meta">{fmtDate(p.date)} · {p.methode}</div>
                </div>
                <div className="fin-pay-amount">+ {p.montant.toLocaleString('fr-FR')} €</div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

/* ─── Tab 3: Frais & Dépenses ─── */
function FraisTab() {
  const [frais, setFrais] = useState(SEED_FRAIS)
  const [modal, setModal] = useState(false)

  function addFrais(f) { setFrais(p => [...p, { ...f, id: Date.now() }]) }
  function del(id)      { setFrais(p => p.filter(f => f.id !== id)) }

  return (
    <div className="fin-card">
      <div className="fin-card-head">
        <div>
          <div className="fin-card-title">Frais &amp; Dépenses du Salon</div>
          <div className="fin-card-sub">Suivi des charges d&apos;exploitation pour le calcul de votre rentabilité.</div>
        </div>
        <button className="sh-btn sh-btn-gold" onClick={() => setModal(true)}>
          <SIcon name="plus" size={13}/>Déclarer un Frais
        </button>
      </div>

      {frais.length === 0 && (
        <div className="fin-pay-empty" style={{ color:'var(--muted)' }}>Aucun frais déclaré pour cette période.</div>
      )}

      <div className="fin-frais-list">
        {frais.map(f => (
          <div key={f.id} className="fin-frais-row">
            <div className="fin-frais-info">
              <div className="fin-frais-titre">{f.titre}</div>
              {f.desc && <div className="fin-frais-desc">{f.desc}</div>}
              <div className="fin-frais-date">Déclaré le {fmtDate(f.date)}</div>
            </div>
            <div className="fin-frais-right">
              <span className="fin-frais-amount">- {f.montant.toLocaleString('fr-FR')} €</span>
              <button className="fin-suppr" onClick={() => del(f.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {modal && <FraisModal onClose={() => setModal(false)} onAdd={addFrais}/>}
    </div>
  )
}

/* ─── Root ─── */
export default function FinanceScreen() {
  const [tab, setTab]       = useState(0)
  const [period, setPeriod] = useState('Mois')

  return (
    <div className="sh-page fin-page">
      {/* Top row: tabs + period + CSV */}
      <div className="fin-toprow">
        <div className="fin-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={'fin-tab' + (tab === i ? ' active' : '')} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
        <div className="fin-controls">
          <div className="fin-periods">
            {PERIODS.map(p => (
              <button key={p} className={'fin-period-btn' + (period === p ? ' active' : '')} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button className="sh-btn fin-csv-btn">
            <SIcon name="download" size={13}/>Rapport CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="fin-content">
        {tab === 0 && <AnalysesTab period={period}/>}
        {tab === 1 && <PaiementsTab/>}
        {tab === 2 && <FraisTab/>}
      </div>
    </div>
  )
}
