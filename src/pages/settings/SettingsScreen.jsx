import { useState, useRef } from 'react'
import SIcon from '../../components/SIcon'
import './SettingsScreen.css'

const DEVISES = [
  { code:'EUR', label:'Euro (€)' },
  { code:'USD', label:'Dollar ($)' },
  { code:'GBP', label:'Livre (£)' },
  { code:'MAD', label:'Dirham (MAD)' },
  { code:'CHF', label:'Franc suisse (CHF)' },
]

const DEFAULTS = {
  nomSalon:    'Salon Haire Prestige',
  telephone:   '+33 1 42 66 50 00',
  devise:      'EUR',
  tva:         '20',
  adresse:     '14 Rue Royale, 75008 Paris',
  ouverture:   '09:00',
  fermeture:   '19:00',
}

export default function SettingsScreen() {
  const [form, setForm]     = useState(DEFAULTS)
  const [saved, setSaved]   = useState(false)
  const timerRef            = useRef(null)

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function enregistrer(e) {
    e.preventDefault()
    setSaved(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSaved(false), 2400)
  }

  function exporterJSON() {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'reglages-salon.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="sh-page cfg-page">
      <form className="cfg-card" onSubmit={enregistrer}>
        {/* Card header */}
        <div className="cfg-card-head">
          <div>
            <div className="cfg-card-title">Paramètres de l&apos;établissement</div>
            <div className="cfg-card-sub">Configurez les informations d&apos;en-tête de facture, taxes, et horaires d&apos;ouverture.</div>
          </div>
        </div>

        {/* Form body */}
        <div className="cfg-body">
          {/* NOM DU SALON */}
          <label className="cfg-label">
            NOM DU SALON
            <input value={form.nomSalon} onChange={upd('nomSalon')} placeholder="Salon Haire Prestige"/>
          </label>

          {/* TEL + DEVISE + TVA */}
          <div className="cfg-row-3">
            <label className="cfg-label">
              TÉLÉPHONE DU SALON
              <input value={form.telephone} onChange={upd('telephone')} placeholder="+33 1 00 00 00 00"/>
            </label>
            <label className="cfg-label">
              DEVISE STANDARD
              <select value={form.devise} onChange={upd('devise')}>
                {DEVISES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
              </select>
            </label>
            <label className="cfg-label">
              TAUX DE TVA (%)
              <input type="number" min="0" max="100" step="0.1" value={form.tva} onChange={upd('tva')} placeholder="20"/>
            </label>
          </div>

          {/* ADRESSE */}
          <label className="cfg-label">
            ADRESSE DE L&apos;ÉTABLISSEMENT
            <input value={form.adresse} onChange={upd('adresse')} placeholder="14 Rue Royale, 75008 Paris"/>
          </label>

          {/* HORAIRES */}
          <div className="cfg-row-2">
            <label className="cfg-label">
              HEURE D&apos;OUVERTURE
              <input type="time" value={form.ouverture} onChange={upd('ouverture')}/>
            </label>
            <label className="cfg-label">
              HEURE DE FERMETURE
              <input type="time" value={form.fermeture} onChange={upd('fermeture')}/>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="cfg-footer">
          <button type="button" className="cfg-export-btn" onClick={exporterJSON}>
            <SIcon name="download" size={14}/>Exporter les réglages (JSON)
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {saved && <span className="cfg-saved-msg"><SIcon name="check" size={14}/>Modifications enregistrées</span>}
            <button type="submit" className="sh-btn sh-btn-gold cfg-save-btn">
              Enregistrer les Modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
