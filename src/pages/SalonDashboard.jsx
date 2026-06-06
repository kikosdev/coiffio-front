import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SIcon from '../components/SIcon'
import { useNotifications } from '../hooks/useNotifications'
import { disconnectSocket } from '../services/socket'
import './SalonDashboard.css'

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

/* ═══════════════════════════════════════════════════════════
   SERVICES SCREEN
═══════════════════════════════════════════════════════════ */

const SERVICES = [
  { id:1,  audience:['universal'], section:'cuts',       name:'Signature Cut',       desc:'Consultation, precision cut, and bespoke finish with our most senior stylist.',                         dur:'60 min', from:78,  tags:[],       featured:false },
  { id:2,  audience:['universal'], section:'cuts',       name:'Express Refresh',     desc:'A 30-minute trim and re-shape between full visits.',                                                   dur:'30 min', from:42,  tags:[] },
  { id:3,  audience:['universal'], section:'treatments', name:'Olaplex Bond Builder', desc:'Repairs broken bonds at the deepest level — restores elasticity and shine after any chemical service.', dur:'45 min', from:95,  tags:['gold'], featured:true },
  { id:10, audience:['women'],     section:'color',      name:'Signature Balayage',  desc:'Hand-painted lightening tailored to your features, finished with a tone-true gloss.',                  dur:'2h 30m', from:240, tags:['gold'], featured:true },
  { id:11, audience:['women'],     section:'color',      name:'Full Permanent Color', desc:'Root-to-tip permanent color with bond-protective additive.',                                           dur:'1h 45m', from:145, tags:[] },
  { id:12, audience:['women'],     section:'color',      name:'Couture Highlights',  desc:'Foil-by-foil hand placement for editorial dimension.',                                                  dur:'3h',     from:285, tags:['gold'] },
  { id:13, audience:['women'],     section:'color',      name:'Glossing Service',    desc:'A standalone toner to refresh hue and add mirror finish.',                                              dur:'30 min', from:60,  tags:[] },
  { id:14, audience:['women'],     section:'treatments', name:'Keratin Smoothing',   desc:'Long-lasting smoothing that tames frizz — formaldehyde-free formula.',                                  dur:'2h 30m', from:280, tags:['gold'] },
  { id:15, audience:['women'],     section:'treatments', name:'Scalp & Sound Ritual', desc:'A 60-minute scalp massage paired with tonal sound therapy in our private spa room.',                  dur:'60 min', from:110, tags:['gold'] },
  { id:16, audience:['women'],     section:'styling',    name:'Editorial Blowout',   desc:'A camera-ready finish: round-brush sculpting and styling for photo, event, or evening.',               dur:'45 min', from:75,  tags:[] },
  { id:17, audience:['women'],     section:'styling',    name:'Bridal & Event',      desc:'Trial and day-of styling with optional hairpiece work.',                                                dur:'2h',     from:220, tags:['gold'] },
  { id:20, audience:['men'],       section:'cuts',       name:'Classic Gentleman',   desc:'Scissor-over-comb cut with a hot-towel finish and complimentary scalp massage.',                       dur:'45 min', from:65,  tags:[] },
  { id:21, audience:['men'],       section:'cuts',       name:'Skin Fade',           desc:'Precision clipper fade with detailed line-up, blended to your preferred grade.',                       dur:'45 min', from:55,  tags:[] },
  { id:22, audience:['men'],       section:'grooming',   name:'Beard Sculpt',        desc:'Shape, line, and condition — finished with our house tonic.',                                           dur:'30 min', from:35,  tags:[] },
  { id:23, audience:['men'],       section:'grooming',   name:'Royal Shave',         desc:'Traditional straight-razor shave, three hot towels, balm, and finish.',                                dur:'45 min', from:75,  tags:['gold'], featured:true },
  { id:24, audience:['men'],       section:'treatments', name:'Anti-Grey Tinting',   desc:'A discreet tint that softens grey by 50% — washes out in 4-6 weeks.',                                 dur:'30 min', from:45,  tags:[] },
]

const SVC_SECTIONS = [
  { id:'cuts',       num:'I.',   title:<>The <em>Cut</em></>,     lead:'Foundational' },
  { id:'color',      num:'II.',  title:<>The <em>Color</em></>,   lead:'Tonal · Dimensional' },
  { id:'grooming',   num:'III.', title:<>The <em>Groom</em></>,   lead:'Beard · Shave · Skin' },
  { id:'treatments', num:'IV.',  title:<>The <em>Ritual</em></>,  lead:'Treatment · Spa' },
  { id:'styling',    num:'V.',   title:<>The <em>Finish</em></>,  lead:'Styling · Event' },
]

const SVC_FILTERS = [
  { id:'all', label:'All' }, { id:'women', label:'Women' },
  { id:'universal', label:'Universal' }, { id:'men', label:'Men' },
]

function ServicesScreen() {
  const [filter, setFilter] = useState('all')
  const [glide, setGlide]   = useState({ left:4, width:0 })
  const filterRef           = useRef(null)

  useEffect(() => {
    if (!filterRef.current) return
    const btn = filterRef.current.querySelector('button.on')
    if (btn) {
      const r  = btn.getBoundingClientRect()
      const pr = filterRef.current.getBoundingClientRect()
      setGlide({ left: r.left - pr.left, width: r.width })
    }
  }, [filter])

  const filtered  = SERVICES.filter(s => filter === 'all' ? true : s.audience.includes(filter))
  const bySection = SVC_SECTIONS.map(sec => ({
    ...sec, items: filtered.filter(s => s.section === sec.id),
  })).filter(s => s.items.length > 0)

  return (
    <div className="sh-page">
      <div className="sh-svc-head">
        <div>
          <div className="sh-eyebrow" style={{marginBottom:6}}>Spring · Summer 26</div>
          <h2 className="sh-serif" style={{fontSize:44, margin:0, fontWeight:500, lineHeight:1.05, letterSpacing:'-0.02em', fontFamily:'var(--serif)'}}>
            La <em style={{fontStyle:'italic', color:'var(--champagne-deep)'}}>Carte</em>
          </h2>
          <p style={{margin:'8px 0 0', color:'var(--muted)', fontSize:13.5, maxWidth:540, lineHeight:1.5}}>
            Our complete services menu. Every service is performed by a senior or master stylist.
          </p>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10}}>
          <div className="sh-svc-filter" ref={filterRef}>
            <div className="sh-svc-glide" style={{ left: glide.left, width: glide.width }} />
            {SVC_FILTERS.map(f => (
              <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </div>
          <div style={{display:'flex', gap:6}}>
            <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="sliders-horizontal" size={13}/>Duration</button>
            <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="euro" size={13}/>Price</button>
            <button className="sh-btn sh-btn-sm sh-btn-ghost"><SIcon name="user-round" size={13}/>By stylist</button>
          </div>
        </div>
      </div>

      <div className="sh-gold-rule" />

      {bySection.map(sec => (
        <section key={sec.id} className="sh-svc-section">
          <div className="sh-svc-section-head">
            <span className="num-mark">{sec.num}</span>
            <h3>{sec.title}</h3>
            <span className="slead">{sec.lead}</span>
          </div>
          <div className="sh-svc-grid">
            {sec.items.map(s => (
              <div key={s.id} className={'sh-svc-item' + (s.featured ? ' featured' : '')}>
                <div>
                  <div className="sh-svc-name-row">
                    <span className="sh-svc-name">{s.name}</span>
                    {s.tags.includes('gold') && <span className="sh-svc-tag gold">Signature</span>}
                    {s.audience.includes('women')    && <span className="sh-svc-tag">Women</span>}
                    {s.audience.includes('men')      && <span className="sh-svc-tag">Men</span>}
                    {s.audience.includes('universal')&& <span className="sh-svc-tag">Universal</span>}
                  </div>
                  <div className="sh-svc-desc">{s.desc}</div>
                  <div className="sh-svc-meta">
                    <span><SIcon name="clock" size={12}/>{s.dur}</span>
                    <span><SIcon name="users" size={12}/>Senior stylist</span>
                    {s.featured && <span style={{color:'var(--champagne-deep)'}}><SIcon name="star" size={12}/>House signature</span>}
                  </div>
                </div>
                <div className="sh-svc-right">
                  <div className="sh-svc-price">
                    <span className="from">From</span>
                    €{s.from}
                  </div>
                  <button className="sh-btn sh-btn-sm sh-svc-add">
                    <SIcon name="calendar-plus" size={13}/>Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div style={{marginTop:30, padding:'28px 32px', background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24}}>
        <div style={{maxWidth:560}}>
          <div className="sh-eyebrow">Bespoke</div>
          <div className="sh-serif" style={{fontSize:24, marginTop:6, lineHeight:1.15}}>
            Can't find what you're after? Our <em style={{fontStyle:'italic', color:'var(--champagne-deep)'}}>directrices</em> design custom rituals on request.
          </div>
        </div>
        <button className="sh-btn sh-btn-gold"><SIcon name="message-circle" size={14}/>Request a consultation</button>
      </div>
    </div>
  )
}

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
   APP SHELL
═══════════════════════════════════════════════════════════ */

const NAV_PRIMARY = [
  { id:'schedule', label:'Schedule',  icon:'calendar-days', badge:17 },
  { id:'caisse',   label:'La Caisse', icon:'wallet' },
  { id:'services', label:'Services',  icon:'sparkles' },
  { id:'boutique', label:'Boutique',  icon:'shopping-bag', badge:3 },
]
const NAV_SECONDARY = [
  { id:'clients',  label:'Clients',  icon:'users' },
  { id:'reports',  label:'Reports',  icon:'line-chart' },
  { id:'settings', label:'Settings', icon:'settings' },
]

const TOPBAR_META = {
  schedule: { crumb:'Operations / Booking',  title:<>The <em>Day</em></>,       sub:'Live calendar — all stylists' },
  caisse:   { crumb:'Operations / Finance',  title:<>La <em>Caisse</em></>,     sub:'Daily till & flow' },
  services: { crumb:'Catalogue / Services',  title:<>The <em>Carte</em></>,     sub:'Services & treatments' },
  boutique: { crumb:'Retail / Boutique',     title:<>The <em>Boutique</em></>,  sub:'Curated retail' },
}

export default function SalonDashboard() {
  const navigate    = useNavigate()
  const [current,   setCurrent]   = useState('schedule')
  const [role,      setRole]      = useState('employee')
  const [collapsed, setCollapsed] = useState(false)

  function logout() {
    disconnectSocket()
    localStorage.removeItem('haire_role')
    localStorage.removeItem('haire_token')
    navigate('/signin')
  }

  const meta    = TOPBAR_META[current] || TOPBAR_META.schedule
  const appCls  = ['sh-app', collapsed ? 'sh-collapsed' : ''].filter(Boolean).join(' ')

  return (
    <div className={appCls}>
      {/* ── Sidebar ── */}
      <aside className="sh-sb">
        <div className="sh-brand">
          <span className="mark">H</span>
          {!collapsed && <span className="mark mark-rest">aire</span>}
          <span className="dot" />
          {!collapsed && <span className="sub">Salon</span>}
        </div>

        {!collapsed && <div className="sh-section">Operations</div>}
        <div className="sh-nav">
          {NAV_PRIMARY.map(n => (
            <button key={n.id} className={'sh-item' + (current === n.id ? ' active' : '')}
              onClick={() => setCurrent(n.id)} title={collapsed ? n.label : ''}>
              <span className="sh-icon"><SIcon name={n.icon} size={17}/></span>
              <span className="sh-label">{n.label}</span>
              {n.badge && <span className="sh-badge">{n.badge}</span>}
            </button>
          ))}
        </div>

        {!collapsed && <div className="sh-section">Manage</div>}
        <div className="sh-nav">
          {NAV_SECONDARY.map(n => (
            <button key={n.id} className="sh-item" title={collapsed ? n.label : ''}>
              <span className="sh-icon"><SIcon name={n.icon} size={17}/></span>
              <span className="sh-label">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="sh-user">
          <div className="sh-av">O</div>
          <div className="sh-uinfo">
            <div className="un">Owner</div>
            <div className="ur">Salon Manager</div>
          </div>
          {!collapsed && (
            <button className="sh-logout" onClick={logout} title="Sign out">
              <SIcon name="log-out" size={15}/>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="sh-main">
        {/* Topbar */}
        <header className="sh-topbar">
          <button className="sh-icon-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            <SIcon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={18}/>
          </button>
          <div className="sh-tb-title">
            <h1>{meta.title}</h1>
            <span className="sh-crumb">— {meta.sub}</span>
          </div>
          <div className="sh-tb-actions">
            <div className="sh-search">
              <SIcon name="search" size={14}/>
              <input placeholder="Search clients, services, products…"/>
              <kbd>⌘K</kbd>
            </div>
            {current === 'caisse' && (
              <div className="sh-seg" style={{ marginLeft:4 }}>
                <button className={role==='employee'?'on':''} onClick={() => setRole('employee')}>Employee</button>
                <button className={role==='manager'?'on':''} onClick={() => setRole('manager')}>Manager</button>
              </div>
            )}
            <NotifBell/>
          </div>
        </header>

        {/* Screen content */}
        <div className="sh-scroll">
          <div key={current} className="fade-up">
            {current === 'schedule' && <ScheduleScreen />}
            {current === 'caisse'   && <CaisseScreen role={role}/>}
            {current === 'services' && <ServicesScreen />}
            {current === 'boutique' && <BoutiqueScreen />}
          </div>
        </div>
      </main>
    </div>
  )
}
