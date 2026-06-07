import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SIcon from '../components/SIcon'
import { useNotifications } from '../hooks/useNotifications'
import { disconnectSocket } from '../services/socket'
import './SalonDashboard.css'
import TeamScreen from './team/TeamScreen'
import FinanceScreen from './finance/FinanceScreen'
import StockScreen from './stock/StockScreen'
import VentesScreen from './ventes/VentesScreen'
import SettingsScreen from './settings/SettingsScreen'
import ServicesScreen from './services/ServicesScreen'

/* ═══════════════════════════════════════════════════════════
   SHARED DATA
═══════════════════════════════════════════════════════════ */

const SCH_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const HOUR_PX   = 84
const NOW_H     = 13.75 // fake "now" 13:45

const STYLISTS = [
  { id: 'lea',    name: 'Léa Dubois',    role: 'Color · Balayage',     initials: 'L', shift: [10,19], tone: 'ph-3', sparkline: 'M0 16 Q 10 4 22 10 T 44 14 T 66 6 T 88 12 T 110 18' },
  { id: 'marcus', name: 'Marcus Voss',   role: "Men's Grooming",       initials: 'M', shift: [9,17],  tone: 'ph-7', sparkline: 'M0 14 Q 12 18 24 8 T 48 12 T 72 4 T 96 14 T 110 10' },
  { id: 'theo',   name: 'Théo Roux',     role: 'Cuts · Styling',       initials: 'T', shift: [11,20], tone: 'ph-2', sparkline: 'M0 18 Q 14 10 28 14 T 56 6 T 84 10 T 110 4' },
  { id: 'nadia',  name: 'Nadia Hassan',  role: 'Treatments · Spa',     initials: 'N', shift: [9,16],  tone: 'ph-5', sparkline: 'M0 10 Q 12 14 24 6 T 48 14 T 72 8 T 96 18 T 110 12' },
]

const APPOINTMENTS = [
  { s:'lea',    start:10,    dur:1.5, title:'Balayage signature',  client:'Aïcha B.',     status:'confirmed', price:240 },
  { s:'lea',    start:12,    dur:0.5, title:'Glossing',            client:'Jean P.',      status:'confirmed', price:60  },
  { s:'lea',    start:13.5,  dur:2,   title:'Full color + cut',    client:'Isabelle V.',  status:'pending',   price:185 },
  { s:'lea',    start:16.5,  dur:1.5, title:'Ombré refresh',       client:'Margaux T.',   status:'confirmed', price:160 },
  { s:'marcus', start:9,     dur:0.5, title:'Beard sculpt',        client:'Olivier S.',   status:'confirmed', price:35  },
  { s:'marcus', start:10,    dur:1,   title:'Skin fade',           client:'Léon C.',      status:'confirmed', price:55  },
  { s:'marcus', start:11.5,  dur:1,   title:'Classic cut',         client:'Hugo M.',      status:'confirmed', price:48  },
  { s:'marcus', start:14,    dur:1.5, title:'Hot towel & cut',     client:'Dr. Faure',    status:'pending',   price:95  },
  { s:'marcus', start:16,    dur:0.5, title:'Cleanup',             client:'Antoine R.',   status:'confirmed', price:25  },
  { s:'theo',   start:11.5,  dur:1,   title:'Blowout',             client:'Sophie L.',    status:'confirmed', price:75  },
  { s:'theo',   start:13,    dur:1.5, title:'Bridal trial',        client:'Camille O.',   status:'pending',   price:140 },
  { s:'theo',   start:15,    dur:2,   title:'Cut & finish',        client:'Élise N.',     status:'confirmed', price:120 },
  { s:'theo',   start:18,    dur:1,   title:'Event styling',       client:'Mlle. Verne',  status:'confirmed', price:110 },
  { s:'nadia',  start:9.5,   dur:1.5, title:'Keratin treatment',   client:'Aurélie Z.',   status:'confirmed', price:210 },
  { s:'nadia',  start:11.5,  dur:1,   title:'Scalp ritual',        client:'Lou R.',       status:'confirmed', price:85  },
  { s:'nadia',  start:13,    dur:1.5, title:'Olaplex bond',        client:'Inès D.',      status:'confirmed', price:135 },
  { s:'nadia',  start:15,    dur:1,   title:'Deep nourish',        client:'Marie L.',     status:'pending',   price:90  },
]

const fmtHr = (h) => {
  const hr = Math.floor(h)
  const mn = Math.round((h - hr) * 60)
  return `${hr.toString().padStart(2,'0')}:${mn.toString().padStart(2,'0')}`
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW SCREEN (Accueil)
═══════════════════════════════════════════════════════════ */

const LOW_STOCK = [
  { name: 'Metal Detox Anti-Metal Cleansing Cream', qty: 3, threshold: 5 },
  { name: 'Tecni.Art Savage Panache Hairspray',     qty: 2, threshold: 5 },
]

function OverviewScreen({ setCurrent }) {
  const now = new Date()
  const day = now.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
  const dayCapital = day.charAt(0).toUpperCase() + day.slice(1)

  const kpis = [
    { label:"Chiffre d'affaires", icon:'credit-card',  value:'0 €', trend:'↑12%', pos:true  },
    { label:'Rendez-vous du jour', icon:'calendar-days', value:'0',   trend:'↑8%',  pos:true  },
    { label:'Ventes encaissées',   icon:'shopping-bag',  value:'0',   trend:'↑15%', pos:true  },
    { label:'Alertes stock bas',   icon:'package',       value:'2',   trend:'+2',   pos:false },
  ]

  return (
    <div className="sh-page sh-overview">
      {/* Header */}
      <div className="sh-ov-header">
        <div>
          <h2 className="sh-ov-greeting">Bonjour, <em>Maria Galland</em></h2>
          <p className="sh-ov-sub">Voici l'activité de votre salon pour aujourd'hui, le {dayCapital}.</p>
        </div>
        <div className="sh-ov-actions">
          <button className="sh-btn sh-btn-gold" onClick={() => setCurrent('schedule')}>
            <SIcon name="calendar-plus" size={14}/>Nouveau RDV
          </button>
          <button className="sh-btn" onClick={() => setCurrent('finance')}>
            <SIcon name="banknote" size={14}/>Encaisser RDV
          </button>
          <button className="sh-btn">
            <SIcon name="user-plus" size={14}/>Ajouter Client
          </button>
          <button className="sh-btn" onClick={() => setCurrent('boutique')}>
            <SIcon name="package" size={14}/>Ajuster Stock
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="sh-ov-kpis">
        {kpis.map((k, i) => (
          <div key={i} className="sh-ov-kpi">
            <div className="sh-ov-kpi-top">
              <span className="sh-ov-kpi-label">{k.label.toUpperCase()}</span>
              <span className="sh-ov-kpi-icon"><SIcon name={k.icon} size={16}/></span>
            </div>
            <div className="sh-ov-kpi-value">{k.value}</div>
            <span className={'sh-ov-kpi-trend' + (k.pos ? ' pos' : ' neg')}>{k.trend}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="sh-ov-body">
        {/* Today's appointments */}
        <div className="sh-card sh-ov-appts">
          <div className="sh-card-head">
            <div>
              <h3>Rendez-vous aujourd'hui</h3>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--muted)' }}>Liste chronologique des créneaux planifiés.</p>
            </div>
          </div>
          <div className="sh-ov-empty">Aucun rendez-vous planifié pour aujourd'hui.</div>
        </div>

        {/* Right column */}
        <div className="sh-ov-right">
          {/* Stock alerts */}
          <div className="sh-card sh-ov-stock">
            <div className="sh-card-head">
              <div>
                <h3>Alertes de Stock Bas</h3>
                <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--muted)' }}>Produits devant faire l'objet d'un réapprovisionnement.</p>
              </div>
            </div>
            <div className="sh-ov-stock-list">
              {LOW_STOCK.map((p, i) => (
                <div key={i} className="sh-ov-stock-row">
                  <div>
                    <div className="sh-ov-stock-name">{p.name}</div>
                    <div className="sh-ov-stock-sub">Stock restant : <strong>{p.qty}</strong> (Alerte à {p.threshold})</div>
                  </div>
                  <span className="sh-ov-alert-badge">Alerte</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue distribution */}
          <div className="sh-card sh-ov-distrib">
            <h3 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:17, marginBottom:16 }}>Distribution de l'Activité</h3>
            <div className="sh-ov-distrib-rows">
              {[
                { label:'CA Espèces',           value:'0 €' },
                { label:'CA Carte Bancaire',     value:'0 €' },
                { label:'CA Paiements Mobiles',  value:'0 €' },
              ].map((r, i) => (
                <div key={i} className="sh-ov-distrib-row">
                  <span>{r.label}</span><span>{r.value}</span>
                </div>
              ))}
              <div className="sh-ov-distrib-row total">
                <span>Total Encaissé</span><span>0 €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SCHEDULE SCREEN
═══════════════════════════════════════════════════════════ */

function DayArc() {
  const buckets = SCH_HOURS.flatMap(h => [h, h + 0.5])
  const density = buckets.map(t =>
    APPOINTMENTS.reduce((acc, a) => (t >= a.start && t < a.start + a.dur ? acc + 1 : acc), 0)
  )
  const W = 1100, H = 90, PAD_L = 60, PAD_R = 30
  const innerW = W - PAD_L - PAD_R
  const max = 4
  const pts = density.map((v, i) => {
    const x = PAD_L + (i / (density.length - 1)) * innerW
    const y = H - 14 - (v / max) * (H - 28)
    return [x, y]
  })
  const path = pts.reduce((p, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    return p + ` Q ${cx} ${py} ${cx} ${(py + y) / 2} T ${x} ${y}`
  }, '')
  const area = path + ` L ${PAD_L + innerW} ${H - 14} L ${PAD_L} ${H - 14} Z`

  const nowIdx = (NOW_H - 9) * 2
  const nowX   = PAD_L + (nowIdx / (density.length - 1)) * innerW

  return (
    <div className="sh-card" style={{ padding: '16px 22px 12px', marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <div className="sh-eyebrow">Arc of the day</div>
          <div className="sh-serif" style={{ fontSize:17, marginTop:2 }}>
            <em style={{ fontStyle:'italic', color:'var(--champagne-deep)' }}>17</em> appointments
            <span style={{ color:'var(--muted)', marginLeft:10, fontFamily:'var(--sans)', fontSize:12 }}>
              · 14 confirmed · 3 pending
            </span>
          </div>
        </div>
        <div style={{ display:'flex', gap:18 }}>
          {[{ l:'Booked', v:<>82<span style={{fontSize:13,color:'var(--muted)'}}>%</span></> }, { l:'Revenue (D)', v:<>€<em style={{fontStyle:'italic',color:'var(--champagne-deep)'}}>2,148</em></> }, { l:'Walk-ins', v:'4' }].map((s,i) => (
            <div key={i} style={{ display:'flex',flexDirection:'column',gap:6 }}>
              <span style={{ fontSize:10.5,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--muted)',fontWeight:500 }}>{s.l}</span>
              <span style={{ fontFamily:'var(--serif)',fontSize:22,fontWeight:500,letterSpacing:'-0.02em',lineHeight:1 }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:100, display:'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sh-archill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--champagne)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--champagne)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {SCH_HOURS.map((h, i) => {
          const x = PAD_L + ((i * 2) / (density.length - 1)) * innerW
          return (
            <g key={h}>
              <line x1={x} x2={x} y1={H - 14} y2={H - 10} stroke="var(--line-strong)" />
              <text x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="var(--sans)" letterSpacing="0.1em">
                {h.toString().padStart(2,'0')}
              </text>
            </g>
          )
        })}
        <line x1={PAD_L} x2={PAD_L + innerW} y1={H - 14} y2={H - 14} stroke="var(--line-strong)" />
        <path d={area} fill="url(#sh-archill)" />
        <path d={path} fill="none" stroke="var(--champagne)" strokeWidth="1.5" />
        <line x1={nowX} x2={nowX} y1={6} y2={H - 14} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        <circle cx={nowX} cy={H - 14} r="3.5" fill="var(--ink)" />
        <text x={nowX + 8} y={14} fontSize="10" fill="var(--ink)" fontFamily="var(--sans)" fontWeight="500">NOW · 13:45</text>
      </svg>
    </div>
  )
}

function ApptCard({ a }) {
  const top    = (a.start - SCH_HOURS[0]) * HOUR_PX
  const height = a.dur * HOUR_PX - 4
  const cls    = `sh-appt sh-appt-${a.status}`
  return (
    <div className={cls} style={{ top, height }}>
      <div className="sh-appt-bar" />
      <div className="sh-appt-content">
        <div className="sh-appt-title">{a.title}</div>
        <div className="sh-appt-meta">
          <span>{a.client}</span>
          <span style={{ fontVariantNumeric:'tabular-nums', letterSpacing:'0.02em' }}>{fmtHr(a.start)}</span>
        </div>
        <div className="sh-appt-foot">
          {a.status === 'pending' && (
            <span className="sh-chip" style={{ padding:'2px 7px', fontSize:10 }}>
              <span className="sh-chip-dot" style={{ background:'var(--pending)' }} />Pending
            </span>
          )}
          {a.status === 'confirmed' && (
            <span className="sh-chip" style={{ padding:'2px 7px', fontSize:10 }}>
              <span className="sh-chip-dot" style={{ background:'var(--success)' }} />Confirmed
            </span>
          )}
          <span className="sh-appt-price">€{a.price}</span>
        </div>
      </div>
    </div>
  )
}

function StylistColumn({ s }) {
  const myAppts = APPOINTMENTS.filter(a => a.s === s.id)
  const [shiftStart, shiftEnd] = s.shift

  const offTopH = Math.max(0, shiftStart - SCH_HOURS[0])
  const offBotH = Math.max(0, SCH_HOURS[SCH_HOURS.length - 1] + 1 - shiftEnd)

  const gaps = useMemo(() => {
    const out = []
    let t = shiftStart
    const ordered = [...myAppts].sort((a, b) => a.start - b.start)
    for (const a of ordered) {
      if (a.start > t) out.push({ from: t, to: a.start })
      t = Math.max(t, a.start + a.dur)
    }
    if (t < shiftEnd) out.push({ from: t, to: shiftEnd })
    return out
  }, [myAppts, shiftStart, shiftEnd])

  return (
    <div className="sh-col">
      <div className="sh-col-head">
        <div className={`sh-col-portrait ph ${s.tone}`}>
          <span className="sh-col-init">{s.initials}</span>
        </div>
        <div className="sh-col-id">
          <div className="sh-col-name">{s.name}</div>
          <div className="sh-col-role">{s.role}</div>
        </div>
        <div className="sh-col-stats">
          <span className="sh-col-shift">{shiftStart.toString().padStart(2,'0')}:00 – {shiftEnd.toString().padStart(2,'0')}:00</span>
          <svg className="sh-col-spark" viewBox="0 0 110 22" preserveAspectRatio="none">
            <path d={s.sparkline} fill="none" stroke="var(--champagne)" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
      <div className="sh-col-grid" style={{ height: SCH_HOURS.length * HOUR_PX }}>
        {offTopH > 0 && <div className="sh-off-shift" style={{ top:0, height: offTopH * HOUR_PX }} />}
        {offBotH > 0 && <div className="sh-off-shift" style={{ top: (shiftEnd - SCH_HOURS[0]) * HOUR_PX, height: offBotH * HOUR_PX }} />}
        {SCH_HOURS.map((h, i) => <div key={h} className="sh-hour-line" style={{ top: i * HOUR_PX }} />)}
        {SCH_HOURS.map((h, i) => <div key={'half'+h} className="sh-half-line" style={{ top: i * HOUR_PX + HOUR_PX / 2 }} />)}
        {gaps.map((g, i) => {
          const dur = g.to - g.from
          if (dur < 0.5) return null
          return (
            <div key={i} className="sh-avail"
              style={{ top: (g.from - SCH_HOURS[0]) * HOUR_PX, height: dur * HOUR_PX - 4 }}
              title={`Open ${fmtHr(g.from)}–${fmtHr(g.to)}`}>
              <span>Available</span>
              <span className="sh-avail-time">{fmtHr(g.from)}</span>
            </div>
          )
        })}
        {NOW_H >= SCH_HOURS[0] && NOW_H <= SCH_HOURS[SCH_HOURS.length - 1] + 1 && (
          <div className="sh-now-line" style={{ top: (NOW_H - SCH_HOURS[0]) * HOUR_PX }} />
        )}
        {myAppts.map((a, i) => <ApptCard key={i} a={a} />)}
      </div>
    </div>
  )
}

function ScheduleScreen() {
  const [view, setView] = useState('day')
  return (
    <div className="sh-page">
      <div className="sh-page-head">
        <div className="lead">
          <div className="sh-eyebrow" style={{ marginBottom:6 }}>Thursday · 26 May</div>
          <h2>The day, in <em>motion</em>.</h2>
          <p>A live view of every chair. Available slots respect each stylist's shift hours; pending bookings settle once the client confirms.</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div className="sh-seg">
            <button className={view==='day'?'on':''} onClick={() => setView('day')}>Day</button>
            <button className={view==='week'?'on':''} onClick={() => setView('week')}>Week</button>
            <button className={view==='month'?'on':''} onClick={() => setView('month')}>Month</button>
          </div>
          <button className="sh-btn"><SIcon name="chevron-left" size={14}/></button>
          <button className="sh-btn sh-btn-sm">Today</button>
          <button className="sh-btn"><SIcon name="chevron-right" size={14}/></button>
          <button className="sh-btn sh-btn-primary"><SIcon name="plus" size={14}/>New booking</button>
        </div>
      </div>

      <DayArc />

      <div className="sh-legend">
        <div className="sh-legend-item"><span className="sh-lg-sw sh-lg-conf" />Confirmed</div>
        <div className="sh-legend-item"><span className="sh-lg-sw sh-lg-pend" />Pending</div>
        <div className="sh-legend-item"><span className="sh-lg-sw sh-lg-avail" />Available</div>
        <div className="sh-legend-item"><span className="sh-lg-sw sh-lg-off" />Off shift</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="filter" size={13}/>Filter</button>
          <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="users" size={13}/>All stylists</button>
        </div>
      </div>

      <div className="sh-schedule-grid">
        <div className="sh-time-col" style={{ height: SCH_HOURS.length * HOUR_PX + 1 }}>
          {SCH_HOURS.map((h, i) => (
            <div key={h} className="sh-time-tick" style={{ top: i * HOUR_PX }}>
              <span className="sh-time-h">{h.toString().padStart(2,'0')}</span>
              <span className="sh-time-m">:00</span>
            </div>
          ))}
        </div>
        <div className="sh-cols">
          {STYLISTS.map(s => <StylistColumn key={s.id} s={s} />)}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LA CAISSE SCREEN
═══════════════════════════════════════════════════════════ */

const CAISSE_SVCS = [
  { n:'Cut & Style', d:'Senior', p:78 }, { n:'Beard Sculpt', d:'Express', p:35 },
  { n:'Glossing', d:'+ Cut', p:35 },     { n:'Balayage', d:'Signature', p:240 },
  { n:'Keratin', d:'Full', p:280 },       { n:'Scalp Ritual', d:'Spa', p:85 },
]
const CAISSE_PRODUCTS = [
  { n:'Olaplex No. 3', d:'100ml', p:28 },    { n:'Oribe Gold Lust', d:'250ml', p:62 },
  { n:'Kérastase Elixir', d:'100ml', p:48 }, { n:'Davines Oi Oil', d:'135ml', p:38 },
  { n:'Sachajuan Hair Mist', d:'150ml', p:32 }, { n:'Christophe Robin', d:'250ml', p:54 },
]
const MGR_STYLISTS = [
  { name:'Léa Dubois',   role:'Color · Balayage', rev:645, services:4, retail:60, tip:78, util:92 },
  { name:'Théo Roux',    role:'Cuts · Styling',   rev:460, services:4, retail:22, tip:54, util:78 },
  { name:'Marcus Voss',  role:"Men's Grooming",   rev:358, services:5, retail:45, tip:45, util:84 },
  { name:'Nadia Hassan', role:'Treatments · Spa', rev:535, services:4, retail:18, tip:62, util:88 },
]

function EmployeeCaisse() {
  const [tab, setTab]   = useState('services')
  const [cart, setCart] = useState([
    { id:1, name:'Balayage signature', sub:'14:30 · Aïcha B.', price:240, qty:1 },
    { id:2, name:'Glossing add-on',    sub:'finishing treatment', price:35, qty:1 },
    { id:3, name:'Olaplex No. 3',      sub:'100ml · retail', price:28, qty:1 },
  ])
  const [tip, setTip]   = useState(15)
  const [pay, setPay]   = useState('card')

  const list = tab === 'services' ? CAISSE_SVCS : CAISSE_PRODUCTS
  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tipAmt = +(sub * tip / 100).toFixed(2)
  const tax    = +(sub * 0.20).toFixed(2)
  const total  = +(sub + tipAmt).toFixed(2)

  const addItem = (s) => setCart(c => {
    const ex = c.find(x => x.name === s.n)
    if (ex) return c.map(x => x === ex ? { ...x, qty: x.qty + 1 } : x)
    return [...c, { id: Date.now(), name: s.n, sub: s.d, price: s.p, qty: 1 }]
  })
  const changeQty = (id, d) => setCart(c =>
    c.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + d) } : x).filter(x => x.qty > 0)
  )

  return (
    <div className="sh-caisse-grid">
      <div className="sh-caisse-main">
        <div className="sh-kpi-row">
          {[
            { l:'My day',       v:<>€<em>684</em></>,  d:<><strong>+12%</strong> vs. yesterday</> },
            { l:'Tips received',v:<>€<em>92</em></>,   d:'across 6 transactions' },
            { l:'Services',     v:'5',                 d:'2 remaining today' },
            { l:'Retail',       v:<>€<em>138</em></>,  d:'3 items · 18% margin' },
          ].map((k,i) => (
            <div key={i} className="sh-kpi">
              <div className="sh-kpi-l">{k.l}</div>
              <div className="sh-kpi-v">{k.v}</div>
              <div className="sh-kpi-d">{k.d}</div>
            </div>
          ))}
        </div>

        <div className="sh-cat">
          <div className="sh-cat-tabs">
            <button className={tab==='services'?'on':''} onClick={() => setTab('services')}>Services</button>
            <button className={tab==='products'?'on':''} onClick={() => setTab('products')}>Retail</button>
            <button>Tips only</button>
            <button>Refund</button>
            <button>Gift card</button>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, color:'var(--muted)', fontSize:11 }}>
              <SIcon name="lock" size={12}/> Locked to Marcus Voss
            </div>
          </div>
          <div className="sh-cat-grid">
            {list.map((s, i) => (
              <button key={i} className="sh-cat-item" onClick={() => addItem(s)}>
                <div className="ci-n">{s.n}</div>
                <div className="ci-d">{s.d}</div>
                <div className="ci-p">€{s.p}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="sh-card">
          <div className="sh-card-head">
            <h3>Today's <em>transactions</em></h3>
            <span className="sh-chip">6 closed · 1 open</span>
          </div>
          <div>
            {[
              {t:'09:30', name:'Skin Fade',         client:'Léon C.',    amt:55,  tip:8,  method:'Card'},
              {t:'10:45', name:'Beard Sculpt + Cut', client:'Olivier S.', amt:80,  tip:12, method:'Cash'},
              {t:'11:30', name:'Classic Cut',        client:'Hugo M.',    amt:48,  tip:5,  method:'Card'},
              {t:'13:20', name:'Olaplex No. 3',      client:'Walk-in',    amt:28,  tip:0,  method:'Card'},
              {t:'14:00', name:'Hot Towel & Cut',    client:'Dr. Faure',  amt:95,  tip:15, method:'Card'},
              {t:'15:30', name:'Cleanup',            client:'Antoine R.', amt:25,  tip:5,  method:'Cash'},
            ].map((r, i) => (
              <div key={i} className="sh-live-row">
                <span className="sh-live-time">{r.t}</span>
                <div className="sh-live-desc">
                  <span className="sh-live-title">{r.name}</span>
                  <span className="sh-live-sub">{r.client} · {r.method}</span>
                </div>
                <span className="sh-chip" style={{fontSize:10}}>tip €{r.tip}</span>
                <span className="sh-live-amt">€{r.amt}</span>
                <button className="sh-icon-btn"><SIcon name="more-horizontal" size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sh-till">
        <div className="sh-till-head">
          <div>
            <div className="sh-eyebrow">Open ticket</div>
            <div className="sh-serif" style={{fontSize:22, marginTop:2}}>
              Aïcha <em style={{fontStyle:'italic', color:'var(--champagne-deep)'}}>B.</em>
            </div>
            <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>15:30 · chair 2</div>
          </div>
          <button className="sh-icon-btn"><SIcon name="x" size={16}/></button>
        </div>
        <div className="sh-till-items">
          {cart.map(i => (
            <div key={i.id} className="sh-till-item">
              <div>
                <div className="ti-name">{i.name}</div>
                <div className="ti-sub">{i.sub}</div>
              </div>
              <div className="ti-qty">
                <button onClick={() => changeQty(i.id, -1)}><SIcon name="minus" size={12}/></button>
                <span>{i.qty}</span>
                <button onClick={() => changeQty(i.id, 1)}><SIcon name="plus" size={12}/></button>
              </div>
              <div className="ti-price">€{i.price * i.qty}</div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{textAlign:'center', padding:'30px 0', color:'var(--muted)', fontSize:13}}>
              Empty — tap a service or product to begin.
            </div>
          )}
        </div>

        <div className="sh-till-totals">
          <div className="sh-till-line"><span>Subtotal</span><span>€{sub.toFixed(2)}</span></div>
          <div className="sh-till-line">
            <span>Tip</span>
            <div style={{display:'flex', gap:4}}>
              {[0,10,15,20].map(p => (
                <button key={p} onClick={() => setTip(p)} style={{
                  border:'1px solid var(--line)',
                  background: tip===p ? 'var(--ink)' : 'transparent',
                  color: tip===p ? 'var(--surface)' : 'var(--muted)',
                  borderRadius:99, padding:'2px 10px', fontSize:11, cursor:'pointer',
                  fontVariantNumeric:'tabular-nums', fontFamily:'var(--sans)'
                }}>{p}%</button>
              ))}
            </div>
          </div>
          <div className="sh-till-line"><span>Tip amount</span><span>€{tipAmt.toFixed(2)}</span></div>
          <div className="sh-till-line"><span>VAT (incl.)</span><span>€{tax.toFixed(2)}</span></div>
          <div className="sh-till-line total">
            <span className="sh-serif">Total</span>
            <span>€<em>{total.toFixed(2)}</em></span>
          </div>
        </div>

        <div className="sh-till-pay">
          {[{k:'card',n:'Card',icon:'credit-card'},{k:'cash',n:'Cash',icon:'banknote'},{k:'gift',n:'Gift',icon:'gift'}].map(p => (
            <button key={p.k} className={pay===p.k?'on':''} onClick={() => setPay(p.k)}>
              <SIcon name={p.icon} size={18}/>
              <span>{p.n}</span>
            </button>
          ))}
        </div>

        <button className="sh-till-checkout">
          <SIcon name="check" size={18}/> Charge €{total.toFixed(2)}
        </button>
      </div>
    </div>
  )
}

function ManagerCaisse() {
  const maxRev  = Math.max(...MGR_STYLISTS.map(s => s.rev))
  const totalRev = MGR_STYLISTS.reduce((s, x) => s + x.rev, 0)

  const kpis = [
    { l:'Revenue (today)',   v:<>€<em>1,998</em></>, d:<><strong>+18%</strong> vs. last Thu</>, sp:'M0 22 Q 10 16 18 14 T 36 8 T 54 12 T 70 4' },
    { l:'Services revenue',  v:<>€<em>1,750</em></>, d:'17 tickets · avg €103', sp:'M0 18 Q 12 22 22 14 T 44 18 T 70 8' },
    { l:'Retail revenue',    v:<>€<em>248</em></>,   d:<><strong>+34%</strong> attach rate 22%</>, sp:'M0 24 Q 14 18 26 20 T 50 10 T 70 12' },
    { l:'Tips · pooled',     v:<>€<em>239</em></>,   d:'distributed 18:00', sp:'M0 16 Q 14 22 28 12 T 50 16 T 70 6' },
  ]

  return (
    <div style={{display:'flex', flexDirection:'column', gap:18}}>
      <div className="sh-kpi-row">
        {kpis.map((k, i) => (
          <div key={i} className="sh-kpi">
            <div className="sh-kpi-l">{k.l}</div>
            <div className="sh-kpi-v">{k.v}</div>
            <div className="sh-kpi-d">{k.d}</div>
            <svg className="sh-kpi-trend" viewBox="0 0 70 28" preserveAspectRatio="none">
              <path d={k.sp} fill="none" stroke="var(--champagne)" strokeWidth="1.4"/>
            </svg>
          </div>
        ))}
      </div>

      <div className="sh-hourly">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16}}>
          <div>
            <div className="sh-eyebrow">Cash flow · hourly</div>
            <div className="sh-serif" style={{fontSize:18, marginTop:2}}>
              Today's <em style={{fontStyle:'italic', color:'var(--champagne-deep)'}}>rhythm</em>
            </div>
          </div>
          <div style={{display:'flex', gap:14, fontSize:12, color:'var(--muted)'}}>
            <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:3,background:'var(--ink)',borderRadius:2}}/>Services</span>
            <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:3,background:'var(--champagne)',borderRadius:2}}/>Retail</span>
          </div>
        </div>
        <svg viewBox="0 0 1000 200" style={{width:'100%', height:200, display:'block'}} preserveAspectRatio="none">
          {(() => {
            const hours  = [9,10,11,12,13,14,15,16,17,18,19]
            const svc    = [80,145,220,90,180,260,195,230,175,150,25]
            const retail = [10,20,35,12,28,40,35,50,30,20,8]
            const maxV = 280, W=1000, H=200, PL=30, PR=20, PB=28, PT=8
            const innerW = W-PL-PR, innerH = H-PT-PB
            const barW = innerW/hours.length*0.55, slot = innerW/hours.length
            return (
              <g>
                {[0,100,200,300].map(v => (
                  <g key={v}>
                    <line x1={PL} x2={W-PR} y1={PT+innerH-(v/maxV)*innerH} y2={PT+innerH-(v/maxV)*innerH} stroke="var(--line)" />
                    <text x={W-PR+4} y={PT+innerH-(v/maxV)*innerH+3} fontSize="9" fill="var(--muted-2)" fontFamily="var(--sans)">€{v}</text>
                  </g>
                ))}
                {hours.map((h, i) => {
                  const cx = PL+slot/2+i*slot, sH=(svc[i]/maxV)*innerH, rH=(retail[i]/maxV)*innerH
                  return (
                    <g key={h}>
                      <rect x={cx-barW/2} y={PT+innerH-sH} width={barW} height={sH} fill="var(--ink)" rx="3"/>
                      <rect x={cx-barW/2} y={PT+innerH-sH-rH-2} width={barW} height={rH} fill="var(--champagne)" rx="3"/>
                      <text x={cx} y={H-8} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--sans)" letterSpacing="0.05em">
                        {h.toString().padStart(2,'0')}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })()}
        </svg>
      </div>

      <div className="sh-perf">
        <div className="sh-perf-row head">
          <span/><span>Stylist</span><span>Services</span><span>Retail</span><span>Tips</span><span>Revenue share</span>
        </div>
        {MGR_STYLISTS.map((s, i) => (
          <div key={i} className="sh-perf-row">
            <div className="sh-av" style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#c9a575,#8a6d4a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:16}}>
              {s.name[0]}
            </div>
            <div className="sh-perf-name">
              <span className="pn">{s.name}</span>
              <span className="pr">{s.role} · utilisation {s.util}%</span>
            </div>
            <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€{s.rev - s.retail}</span>
            <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€{s.retail}</span>
            <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€{s.tip}</span>
            <div className="sh-perf-bar"><span style={{ width:`${(s.rev/maxRev)*100}%` }} /></div>
          </div>
        ))}
        <div className="sh-perf-row" style={{background:'var(--surface-2)'}}>
          <span/><div className="sh-perf-name"><span className="pn" style={{fontStyle:'italic'}}>Salon total</span></div>
          <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€1,853</span>
          <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€145</span>
          <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums'}}>€239</span>
          <span className="sh-perf-amt" style={{fontVariantNumeric:'tabular-nums', color:'var(--champagne-deep)', fontStyle:'italic'}}>€{totalRev}</span>
        </div>
      </div>

      <div className="sh-live-feed">
        <div className="sh-card-head">
          <h3>Live <em>feed</em></h3>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'var(--success)',boxShadow:'0 0 0 3px rgba(107,142,106,.2)'}}/>
            <span style={{fontSize:11, color:'var(--muted)', letterSpacing:'0.08em'}}>STREAMING · since 09:00</span>
          </div>
        </div>
        {[
          {t:'15:42', name:'Balayage signature',     client:'Aïcha B.',   stylist:'L', stylistName:'Léa',    amt:240, method:'Card', tip:36},
          {t:'15:30', name:'Olaplex No. 3 · retail', client:'Walk-in',    stylist:'M', stylistName:'Marcus', amt:28,  method:'Card', tip:0},
          {t:'15:12', name:'Keratin treatment',       client:'Aurélie Z.', stylist:'N', stylistName:'Nadia',  amt:210, method:'Card', tip:30},
          {t:'14:55', name:'Cut & finish',            client:'Élise N.',   stylist:'T', stylistName:'Théo',   amt:120, method:'Cash', tip:20},
          {t:'14:32', name:'Hot Towel & Cut',         client:'Dr. Faure',  stylist:'M', stylistName:'Marcus', amt:95,  method:'Card', tip:15},
          {t:'14:10', name:'Refund · Oribe Mist',    client:'Sophie L.',  stylist:'L', stylistName:'Léa',    amt:-32, method:'Card', tip:0},
          {t:'13:48', name:'Glossing add-on',         client:'Jean P.',    stylist:'L', stylistName:'Léa',    amt:60,  method:'Card', tip:12},
        ].map((r, i) => (
          <div key={i} className="sh-live-row">
            <span className="sh-live-time">{r.t}</span>
            <div className="sh-live-desc">
              <span className="sh-live-title">{r.name}</span>
              <span className="sh-live-sub">{r.client} · {r.method}</span>
            </div>
            <div className="sh-live-stylist">
              <span className="sh-av-s">{r.stylist}</span>
              <span>{r.stylistName}</span>
            </div>
            {r.tip > 0 ? <span className="sh-chip" style={{fontSize:10}}>+ tip €{r.tip}</span> : <span/>}
            <span className={'sh-live-amt' + (r.amt < 0 ? ' neg' : '')}>
              {r.amt < 0 ? '−' : ''}€{Math.abs(r.amt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CaisseScreen({ role }) {
  return (
    <div className="sh-page">
      <div className="sh-page-head">
        <div className="lead">
          <div className="sh-eyebrow" style={{marginBottom:6}}>{role==='manager'?'Manager view':'Stylist till'} · live</div>
          <h2>{role==='manager' ? <>The whole <em>floor</em>.</> : <>Your <em>chair</em>, your till.</>}</h2>
          <p>{role==='manager'
            ? 'Consolidated cash flow, hourly rhythm, and individual contribution — refreshed the moment a ticket closes.'
            : 'A locked till just for you. Add services and retail, capture tips, and close the ticket in two taps.'}</p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="sh-btn"><SIcon name="download" size={14}/>Export</button>
          {role==='manager'
            ? <button className="sh-btn sh-btn-primary"><SIcon name="bar-chart-3" size={14}/>Full report</button>
            : <button className="sh-btn sh-btn-primary"><SIcon name="plus" size={14}/>New ticket</button>}
        </div>
      </div>
      {role === 'manager' ? <ManagerCaisse /> : <EmployeeCaisse />}
    </div>
  )
}

/* Services management screen is in its own file */

/* ═══════════════════════════════════════════════════════════
   BOUTIQUE SCREEN
═══════════════════════════════════════════════════════════ */

const PRODUCTS = [
  { id:1, brand:'Oribe',             name:'Gold Lust Repair Shampoo',      cat:'shampoo',   tag:'BESTSELLER', price:62, tone:'ph-3', size:'250ml' },
  { id:2, brand:'Olaplex',           name:'No. 3 Hair Perfector',          cat:'treatment', tag:null,         price:28, tone:'ph-5', size:'100ml' },
  { id:3, brand:'Kérastase',         name:'Élixir Ultime Oil',             cat:'treatment', tag:'NEW',        price:48, tone:'ph-2', size:'100ml' },
  { id:4, brand:'Davines',           name:'Oi Absolute Beautifying Oil',   cat:'treatment', tag:null,         price:38, tone:'ph-4', size:'135ml' },
  { id:5, brand:'Sachajuan',         name:'Hair in the Air Spray',         cat:'styling',   tag:null,         price:32, tone:'ph-6', size:'150ml' },
  { id:6, brand:'Christophe Robin',  name:'Cleansing Purifying Scrub',     cat:'shampoo',   tag:'EDITORS PICK', price:54, tone:'ph-3', size:'250ml' },
  { id:7, brand:'Aesop',             name:'Classic Shampoo',               cat:'shampoo',   tag:null,         price:36, tone:'ph-2', size:'200ml' },
  { id:8, brand:'Aveda',             name:'Damage Remedy Restructuring',   cat:'treatment', tag:null,         price:42, tone:'ph-5', size:'150ml' },
  { id:9, brand:'Hershesons',        name:'Almost Everything Cream',       cat:'styling',   tag:'NEW',        price:34, tone:'ph-4', size:'100ml' },
]
const PROD_CATS = [
  { id:'all', label:'All' }, { id:'shampoo', label:'Shampoo & Care' },
  { id:'treatment', label:'Treatments' }, { id:'styling', label:'Styling' },
  { id:'tools', label:'Tools' }, { id:'gift', label:'Gift sets' },
]

function BoutiqueScreen() {
  const [cat,  setCat]  = useState('all')
  const [favs, setFavs] = useState({ 1:true, 5:true })
  const [cart, setCart] = useState([
    { id:2, brand:'Olaplex', name:'No. 3 Hair Perfector',     price:28, qty:1, tone:'ph-5' },
    { id:1, brand:'Oribe',   name:'Gold Lust Repair Shampoo', price:62, qty:1, tone:'ph-3' },
  ])
  const [mode, setMode] = useState('customer')

  const list = PRODUCTS.filter(p => cat === 'all' ? true : p.cat === cat)

  const addToCart = (p) => setCart(c => {
    const ex = c.find(x => x.id === p.id)
    if (ex) return c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
    return [...c, { id:p.id, brand:p.brand, name:p.name, price:p.price, qty:1, tone:p.tone }]
  })

  const sub   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const ship  = mode === 'customer' ? 8 : 0
  const total = sub + ship

  return (
    <div className="sh-page">
      <div className="sh-page-head">
        <div className="lead">
          <div className="sh-eyebrow" style={{marginBottom:6}}>Curated retail</div>
          <h2>The <em>Boutique</em>.</h2>
          <p>The same products our stylists use, on a shelf you can take home. Complimentary shipping over €120.</p>
        </div>
        <div className="sh-seg">
          <button className={mode==='customer'?'on':''} onClick={() => setMode('customer')}>Customer</button>
          <button className={mode==='staff'?'on':''} onClick={() => setMode('staff')}>In-salon</button>
        </div>
      </div>

      <div className="sh-feat-banner">
        <div className="sh-feat-text">
          <div className="sh-eyebrow">House signature · just landed</div>
          <h3>The <em>Restoration</em><br/>Capsule.</h3>
          <p>Six months of work with our master colorists, distilled into a three-step home ritual.</p>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button className="sh-btn sh-btn-gold"><SIcon name="sparkle" size={14}/>Shop the capsule</button>
            <button className="sh-btn" style={{background:'transparent', borderColor:'rgba(243,236,224,.2)', color:'rgba(243,236,224,.9)'}}>The story</button>
          </div>
        </div>
        <div className="sh-feat-img">
          <div className="ph ph-2" style={{position:'absolute', inset:0}} />
          <div style={{position:'absolute', top:18, right:20, background:'rgba(28,22,18,.85)', color:'var(--champagne)', fontFamily:'var(--serif)', fontStyle:'italic', padding:'8px 14px', borderRadius:99, fontSize:13}}>
            from €185
          </div>
        </div>
      </div>

      <div className="sh-boutique-tools">
        <div className="sh-bt-pills">
          {PROD_CATS.map(c => (
            <button key={c.id} className={'sh-bt-pill' + (cat===c.id?' on':'')} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:6, alignItems:'center'}}>
          <span style={{fontSize:11, color:'var(--muted)', letterSpacing:'0.08em'}}>{list.length} PRODUCTS</span>
          <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="arrow-up-down" size={13}/>Sort</button>
        </div>
      </div>

      <div className="sh-boutique-grid">
        <div className="sh-prod-grid">
          {list.map(p => (
            <div key={p.id} className="sh-prod">
              <div className="sh-prod-img">
                <div className={`ph ${p.tone}`} style={{position:'absolute', inset:0}} />
                {p.tag && <span className={'sh-prod-tag' + (p.tag === 'NEW' ? ' gold' : '')}>{p.tag}</span>}
                <button
                  className={'sh-prod-fav' + (favs[p.id] ? ' fav' : '')}
                  onClick={e => { e.stopPropagation(); setFavs(f => ({...f, [p.id]: !f[p.id]})) }}
                >
                  <SIcon name="heart" size={14} strokeWidth={favs[p.id] ? 0 : 1.6} style={favs[p.id] ? {fill:'currentColor'} : {}} />
                </button>
              </div>
              <div className="sh-prod-body">
                <span className="sh-prod-brand">{p.brand}</span>
                <span className="sh-prod-name">{p.name}</span>
                <div className="sh-prod-foot">
                  <div>
                    <span className="sh-prod-price">€<em>{p.price}</em></span>
                    <span style={{display:'block', fontSize:11, color:'var(--muted)', marginTop:2}}>{p.size}</span>
                  </div>
                  <button className="sh-prod-add" onClick={() => addToCart(p)} title="Add">
                    <SIcon name="plus" size={16}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sh-cart">
          <div className="sh-cart-head">
            <h3>{mode==='customer' ? <>Your <em>basket</em></> : <>Add to <em>ticket</em></>}</h3>
            <span className="sh-chip sh-chip-gold">{cart.reduce((s,i) => s+i.qty, 0)} items</span>
          </div>
          <div className="sh-cart-items">
            {cart.length === 0 && (
              <div style={{padding:'24px 0', textAlign:'center', color:'var(--muted)', fontSize:13}}>Empty — pick something lovely.</div>
            )}
            {cart.map(i => (
              <div key={i.id} className="sh-cart-row">
                <div className={`ph ${i.tone}`} style={{width:48, height:48, borderRadius:'var(--radius-sm)'}} />
                <div>
                  <div className="sh-prod-brand" style={{marginBottom:2}}>{i.brand}</div>
                  <div className="cn">{i.name}</div>
                  <div className="cs" style={{display:'flex', alignItems:'center', gap:8, marginTop:4}}>
                    <span>Qty</span>
                    <div className="sh-ti-qty">
                      <button onClick={() => setCart(c => c.map(x => x.id===i.id ? {...x, qty:Math.max(0,x.qty-1)} : x).filter(x => x.qty>0))}><SIcon name="minus" size={12}/></button>
                      <span>{i.qty}</span>
                      <button onClick={() => setCart(c => c.map(x => x.id===i.id ? {...x, qty:x.qty+1} : x))}><SIcon name="plus" size={12}/></button>
                    </div>
                  </div>
                </div>
                <div className="cp">€{i.price * i.qty}</div>
              </div>
            ))}
          </div>
          <div className="sh-cart-foot">
            <div className="sh-cart-line"><span>Subtotal</span><span>€{sub}</span></div>
            {mode === 'customer'
              ? <div className="sh-cart-line"><span>Shipping</span><span>€{ship}</span></div>
              : <div className="sh-cart-line"><span>Attached to</span><span>Ticket #2148</span></div>}
            <div className="sh-cart-line"><span>VAT (incl.)</span><span>€{(sub * 0.20).toFixed(2)}</span></div>
            <div className="sh-cart-line total">
              <span className="sh-serif">Total</span>
              <span>€<em>{total}</em></span>
            </div>
            <button className="sh-btn sh-btn-primary" style={{width:'100%', marginTop:14, padding:'14px 16px', fontSize:14}}>
              {mode === 'customer' ? <><SIcon name="lock" size={14}/>Secure checkout</> : <><SIcon name="plus-circle" size={14}/>Add to active ticket</>}
            </button>
            <button className="sh-btn sh-btn-ghost" style={{width:'100%', marginTop:6}}>
              {mode === 'customer' ? 'Reserve for in-salon pickup' : 'Save for later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION BELL
═══════════════════════════════════════════════════════════ */

function NotifBell() {
  const { items, unreadCount, open, openPanel, closePanel, markRead, markAllRead } = useNotifications()
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) closePanel()
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, closePanel])

  const NOTIF_ICONS = {
    appointment_created:'calendar-plus', appointment_confirmed:'calendar-check',
    appointment_cancelled:'calendar-x',  appointment_reminder:'bell',
    payment_recorded:'banknote',         low_stock:'package',
    out_of_stock:'alert-triangle',       sale_recorded:'shopping-bag',
    timeoff_requested:'clock',           timeoff_decision:'check-circle',
  }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        className="sh-icon-btn"
        onClick={open ? closePanel : openPanel}
        style={{ position:'relative' }}
      >
        <SIcon name="bell" size={18}/>
        {unreadCount > 0 && (
          <span style={{ position:'absolute', top:6, right:6, minWidth:14, height:14, borderRadius:99, background:'var(--champagne)', border:'2px solid var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff', padding:'0 3px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position:'absolute', top:46, right:0, width:360, background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-card)', zIndex:200, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:500 }}>
              Notifications {unreadCount > 0 && <span style={{ fontSize:11, background:'var(--champagne-soft)', color:'var(--champagne-deep)', borderRadius:99, padding:'2px 7px', marginLeft:6 }}>{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background:'none', border:0, fontSize:11.5, color:'var(--champagne-deep)', cursor:'pointer', fontFamily:'var(--serif)', fontStyle:'italic' }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {items.length === 0 ? (
              <div style={{ padding:'32px 18px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
                <SIcon name="bell" size={24} style={{ marginBottom:8, opacity:0.3 }}/>
                <div>No notifications</div>
              </div>
            ) : items.map((n, i) => (
              <div key={n._id || i} onClick={() => !n.isRead && markRead(n._id)}
                style={{ display:'flex', gap:12, padding:'12px 18px', borderBottom: i < items.length-1 ? '1px solid var(--line)' : 0, background: n.isRead ? 'transparent' : 'rgba(184,153,104,.05)', cursor: n.isRead ? 'default' : 'pointer', transition:'background .15s' }}>
                <div style={{ width:32, height:32, borderRadius:'var(--radius-sm)', background:'var(--champagne-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--champagne-deep)', flexShrink:0, marginTop:2 }}>
                  <SIcon name={NOTIF_ICONS[n.type] || 'bell'} size={14}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:12.5, fontWeight: n.isRead ? 400 : 600, color:'var(--ink)', lineHeight:1.3 }}>{n.title}</span>
                    {!n.isRead && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--champagne)', flexShrink:0, marginTop:4 }}/>}
                  </div>
                  <div style={{ fontSize:11.5, color:'var(--muted)', lineHeight:1.45 }}>{n.body}</div>
                  {n.createdAt && <div style={{ fontSize:10.5, color:'var(--muted-2)', marginTop:4 }}>{new Date(n.createdAt).toLocaleString('fr-FR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CLIENTS CRM SCREEN
═══════════════════════════════════════════════════════════ */

const MOCK_CLIENTS = [
  { id:1, nom:'Alice Dubois',     phone:'+33 6 45 89 23 11', email:'alice.dubois@gmail.com',   notes:'Prefers mild organic shampoos. Always orders tea.',   ca:1240, visits:8,  lastVisit:'2026-05-28' },
  { id:2, nom:'Béatrice Morel',   phone:'+33 6 56 12 90 44', email:'b.morel@gmail.com',          notes:'Allergie nickel — éviter bijoux.',                    ca:680,  visits:5,  lastVisit:'2026-05-15' },
  { id:3, nom:'Catherine Petit',  phone:'+33 6 34 78 56 12', email:'catherine.petit@pro.fr',     notes:'',                                                    ca:920,  visits:6,  lastVisit:'2026-06-01' },
  { id:4, nom:'Damien Vasseur',   phone:'+33 6 78 89 01 22', email:'d.vasseur@icloud.com',       notes:'Client fidèle depuis 2019.',                          ca:2100, visits:18, lastVisit:'2026-05-30' },
  { id:5, nom:'kikos dev',        phone:'+21693418192',       email:'kikosdev@gmail.com',         notes:'',                                                    ca:0,    visits:0,  lastVisit:null },
  { id:6, nom:'Élodie Roussel',   phone:'+33 6 12 90 34 78', email:'elodie.roussel@email.fr',    notes:'VIP · priorité agenda.',                              ca:3450, visits:24, lastVisit:'2026-06-03' },
]

const VISIT_HISTORY = {
  1: [
    { date:'2026-05-28', heure:'14:00', service:'Balayage signature',    stylist:'Léa Dubois',    montant:240, status:'completed' },
    { date:'2026-04-10', heure:'10:30', service:'Glossing + coupe',      stylist:'Léa Dubois',    montant:155, status:'completed' },
    { date:'2026-03-02', heure:'11:00', service:'Olaplex Bond Builder',   stylist:'Nadia Hassan',  montant:95,  status:'completed' },
    { date:'2026-01-20', heure:'15:00', service:'Balayage + soin',        stylist:'Léa Dubois',    montant:310, status:'completed' },
  ],
  2: [
    { date:'2026-05-27', heure:'18:00', service:'Brushing Couture',       stylist:'Sophie Martin', montant:45,  status:'pending'   },
    { date:'2026-05-24', heure:'10:00', service:'Coupe Femme Éditoriale', stylist:'Maria Galland', montant:65,  status:'completed' },
    { date:'2026-03-28', heure:'09:30', service:'Keratin smoothing',      stylist:'Nadia Hassan',  montant:280, status:'completed' },
  ],
  3: [
    { date:'2026-06-01', heure:'16:00', service:'Editorial Blowout',      stylist:'Théo Roux',     montant:75,  status:'completed' },
    { date:'2026-04-22', heure:'13:00', service:'Full Permanent Color',    stylist:'Léa Dubois',    montant:145, status:'completed' },
    { date:'2026-03-10', heure:'11:30', service:'Express Refresh',         stylist:'Théo Roux',     montant:42,  status:'completed' },
  ],
  4: [
    { date:'2026-05-30', heure:'10:00', service:'Classic Gentleman',       stylist:'Marcus Voss',   montant:65,  status:'completed' },
    { date:'2026-05-05', heure:'14:00', service:'Beard Sculpt + Cut',      stylist:'Marcus Voss',   montant:100, status:'completed' },
    { date:'2026-04-15', heure:'11:00', service:'Royal Shave',             stylist:'Marcus Voss',   montant:75,  status:'pending'   },
    { date:'2026-03-22', heure:'09:00', service:'Skin Fade',               stylist:'Marcus Voss',   montant:55,  status:'completed' },
  ],
  5: [],
  6: [
    { date:'2026-06-03', heure:'13:00', service:'Couture Highlights',      stylist:'Léa Dubois',    montant:285, status:'completed' },
    { date:'2026-05-12', heure:'15:00', service:'Scalp & Sound Ritual',    stylist:'Nadia Hassan',  montant:110, status:'completed' },
    { date:'2026-04-28', heure:'10:00', service:'Bridal & Event',          stylist:'Théo Roux',     montant:220, status:'completed' },
    { date:'2026-04-01', heure:'11:00', service:'Balayage signature',      stylist:'Léa Dubois',    montant:240, status:'completed' },
  ],
}

function clInitials(nom) {
  const parts = nom.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : nom.slice(0, 2).toUpperCase()
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function fmtDateLong(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
}

function ClientDetail({ client, onEdit, onDelete }) {
  const history = VISIT_HISTORY[client.id] || []

  return (
    <div className="sh-cl-detail">
      {/* Section header */}
      <div className="sh-cl-det-topbar">
        <span className="sh-cl-det-section-title">Détails du Client</span>
        <div style={{ display:'flex', gap:8 }}>
          <button className="sh-btn sh-btn-sm" onClick={onEdit}>Modifier</button>
          <button className="sh-btn sh-btn-sm sh-btn-danger" onClick={onDelete}>Supprimer</button>
        </div>
      </div>

      {/* Profile */}
      <div className="sh-cl-det-profile">
        <div className="sh-cl-av-lg">{clInitials(client.nom)}</div>
        <div className="sh-cl-det-info">
          <div className="sh-cl-det-name">{client.nom}</div>
          <div className="sh-cl-det-sub">{client.email}</div>
          <div className="sh-cl-det-sub">{client.phone}</div>
        </div>
      </div>

      {client.notes && (
        <div className="sh-cl-det-note">
          Notes : <em>"{client.notes}"</em>
        </div>
      )}

      {/* Stats */}
      <div className="sh-cl-stats">
        <div className="sh-cl-stat">
          <div className="sh-cl-stat-lbl">VISITES</div>
          <div className="sh-cl-stat-val">{client.visits || 0}</div>
        </div>
        <div className="sh-cl-stat">
          <div className="sh-cl-stat-lbl">CA TOTAL</div>
          <div className="sh-cl-stat-val sh-cl-stat-ca">
            {client.ca > 0 ? <>{client.ca} <span>€</span></> : '—'}
          </div>
        </div>
        <div className="sh-cl-stat">
          <div className="sh-cl-stat-lbl">DERNIER</div>
          <div className="sh-cl-stat-val sh-cl-stat-date">{fmtDate(client.lastVisit)}</div>
        </div>
      </div>

      {/* History */}
      <div className="sh-cl-hist">
        <div className="sh-cl-hist-title">Historique des rendez-vous</div>
        {history.length === 0 ? (
          <div className="sh-cl-hist-empty">Aucune visite enregistrée.</div>
        ) : (
          <div className="sh-cl-hist-list">
            {history.map((v, i) => (
              <div key={i} className="sh-cl-hist-row">
                <div className="sh-cl-hist-left">
                  <div className="sh-cl-hist-name">{v.service}</div>
                  <div className="sh-cl-hist-who">
                    Le {fmtDateLong(v.date)} à {v.heure} • avec {v.stylist}
                  </div>
                </div>
                <div className="sh-cl-hist-right">
                  <div className="sh-cl-hist-amt">{v.montant} €</div>
                  <span className={'sh-cl-badge ' + (v.status === 'pending' ? 'pending' : 'completed')}>
                    {v.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AddClientModal({ onClose, onAdd, initial }) {
  const [form, setForm] = useState({ nom: initial?.nom || '', phone: initial?.phone || '', email: initial?.email || '', notes: initial?.notes || '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isEdit = !!initial?.id

  function submit(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onAdd({ ...form, id: isEdit ? initial.id : Date.now(), ca: initial?.ca || 0, visits: initial?.visits || 0, lastVisit: initial?.lastVisit || null })
    onClose()
  }

  return (
    <div className="sh-cl-modal-overlay" onClick={onClose}>
      <div className="sh-cl-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={submit} className="sh-cl-form">
          <div className="sh-cl-modal-title">
            <em>{isEdit ? 'Modifier le Client' : 'Enregistrer un Client'}</em>
          </div>

          <label className="sh-cl-form-label">NOM COMPLET *
            <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Béatrice Morel" required/>
          </label>
          <label className="sh-cl-form-label">TÉLÉPHONE
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 12 34 56 78"/>
          </label>
          <label className="sh-cl-form-label">EMAIL
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="beatrice@yahoo.fr"/>
          </label>
          <label className="sh-cl-form-label">NOTES / PRÉFÉRENCES
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Coupe balayage, préfère le thé…" rows={3}/>
          </label>

          <div className="sh-cl-form-actions">
            <button type="button" className="sh-cl-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="sh-btn sh-btn-gold">
              {isEdit ? 'Enregistrer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientsScreen() {
  const [clients,  setClients]  = useState(MOCK_CLIENTS)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null) // null | 'add' | client (for edit)

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || c.nom.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
  })

  function saveClient(c) {
    setClients(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [...prev, c])
    setSelected(c)
  }

  function deleteClient(c) {
    setClients(prev => prev.filter(x => x.id !== c.id))
    setSelected(null)
  }

  return (
    <div className="sh-page sh-clients">
      <div className="sh-cl-layout">
        {/* ── Left: list ── */}
        <div className="sh-cl-panel">
          <div className="sh-cl-panel-head">
            <div>
              <h3>Fichier Clients</h3>
              <p>Gérez les fiches clients et suivez leur fidélité.</p>
            </div>
            <button className="sh-btn sh-btn-gold" onClick={() => setModal('add')}>
              <SIcon name="plus" size={14}/>Ajouter Client
            </button>
          </div>

          <div className="sh-cl-search">
            <SIcon name="search" size={14}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, email…"
            />
          </div>

          <div className="sh-cl-list">
            {filtered.length === 0 && (
              <div className="sh-ov-empty">Aucun client trouvé.</div>
            )}
            {filtered.map(c => (
              <button
                key={c.id}
                className={'sh-cl-row' + (selected?.id === c.id ? ' active' : '')}
                onClick={() => setSelected(c)}
              >
                <div className="sh-cl-av">{clInitials(c.nom)}</div>
                <div className="sh-cl-row-info">
                  <span className="sh-cl-name">{c.nom}</span>
                  <span className="sh-cl-phone">{c.phone}</span>
                </div>
                <SIcon name="chevron-right" size={15} style={{color:'var(--muted)', flexShrink:0}}/>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: detail ── */}
        <div className="sh-cl-detail-panel">
          {selected ? (
            <ClientDetail
              client={selected}
              onEdit={() => setModal(selected)}
              onDelete={() => deleteClient(selected)}
            />
          ) : (
            <div className="sh-cl-empty">
              <SIcon name="users" size={40} style={{opacity:.25, marginBottom:14}}/>
              <p>Sélectionnez un client dans la liste pour voir sa fiche détaillée, son chiffre d'affaires cumulé et son historique de visites.</p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <AddClientModal
          onClose={() => setModal(null)}
          onAdd={saveClient}
          initial={modal === 'add' ? null : modal}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id:'accueil',  label:'Accueil',       icon:'house' },
  { id:'schedule', label:'Rendez-vous',   icon:'calendar-check' },
  { id:'clients',  label:'Clients',       icon:'users' },
  { id:'team',     label:'Équipe',        icon:'user-cog' },
  { id:'services', label:'Services',      icon:'scissors' },
  { id:'finance',  label:'Finance & POS', icon:'credit-card' },
  { id:'stock',    label:'Stock',         icon:'package' },
  { id:'ventes',   label:'Ventes',        icon:'shopping-bag' },
  { id:'settings', label:'Paramètres',    icon:'settings' },
]

const TOPBAR_META = {
  accueil:  { crumb:'Salon / Accueil',       title:<>Tableau de <em>bord</em></>, sub:"Vue d'ensemble du salon" },
  schedule: { crumb:'Operations / Booking',  title:<>The <em>Day</em></>,         sub:'Live calendar — all stylists' },
  finance:  { crumb:'Operations / Finance',  title:<>POS &amp; <em>Trésorerie</em></>, sub:'Analyses · paiements · dépenses' },
  services: { crumb:'Catalogue / Services',  title:<>The <em>Carte</em></>,       sub:'Services & treatments' },
  ventes:   { crumb:'Retail / Ventes',       title:<>Caisse <em>Revente</em></>,  sub:'Ventes directes · tickets · palmarès' },
  team:     { crumb:'People / Équipe',        title:<><em>Collaborateurs</em></>,  sub:'Horaires · congés · équipe' },
  clients:  { crumb:'Gestion / Clients',     title:<>Clients <em>CRM</em></>,     sub:'Fiches · historique · fidélité' },
  stock:    { crumb:'Gestion / Inventaire', title:<>Stocks <em>&amp; Produits</em></>, sub:'Inventaire · fournisseurs · marges' },
  settings: { crumb:'Salon / Configuration', title:<><em>Configuration</em></>,       sub:'Établissement · taxes · horaires' },
}

export default function SalonDashboard() {
  const navigate    = useNavigate()
  const [current,   setCurrent]   = useState('accueil')
  const [role,      setRole]      = useState('employee')
  const [collapsed, setCollapsed] = useState(false)

  function logout() {
    disconnectSocket()
    localStorage.removeItem('haire_role')
    localStorage.removeItem('haire_token')
    navigate('/signin')
  }

  const meta    = TOPBAR_META[current] || TOPBAR_META.accueil
  const appCls  = ['sh-app', collapsed ? 'sh-collapsed' : ''].filter(Boolean).join(' ')

  return (
    <div className={appCls}>
      {/* ── Sidebar ── */}
      <aside className="sh-sb">
        {/* Fold toggle — sits on the right edge */}
        <button
          className="sh-sb-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Déplier le menu' : 'Plier le menu'}>
          <SIcon name={collapsed ? 'chevron-right' : 'chevron-left'} size={14}/>
        </button>

        {/* Brand */}
        <div className="sh-brand">
          <div className="sh-brand-row">
            <span className="mark">H</span>
            {!collapsed && <><span className="mark mark-rest">aire</span><span className="dot"/></>}
          </div>
          {!collapsed && <span className="sub">Ivory Éditorial</span>}
        </div>

        {/* Unified nav */}
        {!collapsed && <div className="sh-section">Navigation</div>}
        <div className="sh-nav">
          {NAV_ITEMS.map(n => (
            <button key={n.id}
              className={'sh-item' + (current === n.id ? ' active' : '')}
              onClick={() => setCurrent(n.id)}
              title={collapsed ? n.label : ''}>
              <span className="sh-icon"><SIcon name={n.icon} size={17}/></span>
              <span className="sh-label">{n.label}</span>
            </button>
          ))}
        </div>

        {/* Déconnexion */}
        <div className="sh-bottom">
          <button className="sh-item sh-deconnexion" onClick={logout} title={collapsed ? 'Déconnexion' : ''}>
            <span className="sh-icon"><SIcon name="log-out" size={17}/></span>
            <span className="sh-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="sh-main">
        {/* Topbar */}
        <header className="sh-topbar">
          <div className="sh-tb-title">
            <h1>{meta.title}</h1>
            <span className="sh-crumb">— {meta.sub}</span>
          </div>
          <div className="sh-tb-actions">
            <div className="sh-search">
              <SIcon name="search" size={14}/>
              <input placeholder="Rechercher clients, services, produits…"/>
              <kbd>⌘K</kbd>
            </div>
            <NotifBell/>
          </div>
        </header>

        {/* Screen content */}
        <div className="sh-scroll">
          <div key={current} className="fade-up">
            {current === 'accueil'  && <OverviewScreen setCurrent={setCurrent}/>}
            {current === 'schedule' && <ScheduleScreen />}
            {current === 'finance'  && <FinanceScreen />}
            {current === 'services' && <ServicesScreen />}
            {current === 'ventes'   && <VentesScreen />}
            {current === 'team'     && <TeamScreen />}
            {current === 'clients'  && <ClientsScreen />}
            {current === 'stock'    && <StockScreen />}
            {current === 'settings' && <SettingsScreen />}
          </div>
        </div>
      </main>
    </div>
  )
}
