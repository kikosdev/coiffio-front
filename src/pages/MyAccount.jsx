import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import SIcon from '../components/SIcon'

const NAV_ITEMS = [
  { key: 'overview',  icon: 'layout-dashboard', label: 'Overview' },
  { key: 'upcoming',  icon: 'calendar',          label: 'Upcoming', badge: '2' },
  { key: 'history',   icon: 'clock',             label: 'Visit history' },
  { key: 'payments',  icon: 'credit-card',        label: 'Payments' },
  { key: 'loyalty',   icon: 'gem',               label: 'Loyalty' },
  { key: 'profile',   icon: 'user',              label: 'Profile' },
]

export default function MyAccount() {
  const [tab, setTab] = useState('overview')
  const [animKey, setAnimKey] = useState(0)

  function changeTab(key) {
    setTab(key)
    setAnimKey(k => k + 1)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TopNav signedIn />
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '280px 1fr',
        gap: 48, padding: '48px 56px 100px', alignItems: 'start',
      }}>
        {/* ── Sidebar ── */}
        <Sidebar tab={tab} changeTab={changeTab} />

        {/* ── Main content ── */}
        <div key={animKey} className="fade-up">
          {tab === 'overview'  && <OverviewTab  changeTab={changeTab} />}
          {tab === 'upcoming'  && <UpcomingTab />}
          {tab === 'history'   && <HistoryTab />}
          {tab === 'payments'  && <PaymentsTab />}
          {tab === 'loyalty'   && <LoyaltyTab />}
          {tab === 'profile'   && <ProfileTab />}
        </div>
      </div>
    </div>
  )
}

/* ── Sidebar ── */
function Sidebar({ tab, changeTab }) {
  return (
    <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Member ID card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
        <div className="ph-3" style={{ height: 88, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,.18), transparent 40%), radial-gradient(circle at 75% 70%, rgba(0,0,0,.18), transparent 50%)' }} />
        </div>
        <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
          <div style={{
            width: 78, height: 78, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ddc8a8, #a18563)',
            border: '3px solid var(--surface)',
            margin: '-40px auto 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 36,
            color: 'var(--surface)', position: 'relative', zIndex: 2,
            boxShadow: 'var(--shadow-card)',
          }}>É</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            Éloïse <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)', fontWeight: 400 }}>Martin</em>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--champagne-deep)', fontWeight: 600, marginTop: 6 }}>
            <SIcon name="gem" size={12} /> Maison · since Mar 2022
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--line)' }}>
          {[['18', 'Visits'], ['4 280€', 'Spent'], ['342', 'Points']].map(([v, l], i) => (
            <div key={i} style={{ textAlign: 'center', padding: '14px 6px', borderRight: i < 2 ? '1px solid var(--line)' : 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: i === 2 ? 'var(--champagne-deep)' : 'var(--ink)' }}>{v}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 8, display: 'flex', flexDirection: 'column', gap: 2, boxShadow: 'var(--shadow-soft)' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.key} onClick={() => changeTab(item.key)} style={{
            border: 0,
            background: tab === item.key ? 'var(--ink)' : 'transparent',
            color: tab === item.key ? 'var(--surface)' : 'var(--ink-soft)',
            textAlign: 'left', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderRadius: 'var(--radius-sm)', fontSize: 13.5, fontWeight: 450,
            cursor: 'pointer', transition: 'all .15s ease', width: '100%',
          }}>
            <SIcon name={item.icon} size={16} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                background: tab === item.key ? 'var(--champagne)' : 'var(--champagne-soft)',
                color: tab === item.key ? '#1c1612' : 'var(--champagne-deep)',
                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99,
              }}>{item.badge}</span>
            )}
          </button>
        ))}
        <div style={{ height: 1, background: 'var(--line)', margin: '6px 8px' }} />
        <button style={{
          border: 0, background: 'transparent', color: 'var(--danger)',
          textAlign: 'left', padding: '11px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderRadius: 'var(--radius-sm)', fontSize: 13.5, cursor: 'pointer', width: '100%',
        }}>
          <SIcon name="log-out" size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}

/* ── Shared ── */
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, margin: '0 0 8px' }} dangerouslySetInnerHTML={{ __html: title }} />
      {sub && <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, type = 'text', onChange }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          defaultValue={value}
          onChange={onChange}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--surface-inset)', border: '1px solid var(--line)',
            padding: isPassword ? '12px 40px 12px 14px' : '12px 14px',
            borderRadius: 'var(--radius)', fontSize: 14,
            color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)',
            transition: 'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--champagne)'; e.target.style.boxShadow = '0 0 0 3px var(--champagne-soft)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
          >
            <SIcon name={show ? 'eye-off' : 'eye'} size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

function ChipBtn({ children, icon, variant = 'primary', onClick }) {
  const isPrimary = variant === 'primary'
  const isDanger  = variant === 'danger'
  return (
    <button onClick={onClick} style={{
      border: isDanger ? '1px solid rgba(168,74,58,.22)' : isPrimary ? 0 : '1px solid var(--line)',
      background: isDanger ? 'transparent' : isPrimary ? 'var(--champagne)' : 'var(--surface)',
      color: isDanger ? 'var(--danger)' : isPrimary ? '#1c1612' : 'var(--ink-soft)',
      padding: '9px 16px', borderRadius: 'var(--radius)', fontSize: 12.5, fontWeight: 500,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'opacity .15s',
    }}
    onMouseOver={e => e.currentTarget.style.opacity = '.8'}
    onMouseOut={e => e.currentTarget.style.opacity = '1'}
    >
      {icon && <SIcon name={icon} size={13} />}
      {children}
    </button>
  )
}

/* ─── Overview Tab ─── */
function OverviewTab({ changeTab }) {
  return (
    <div>
      <SectionTitle title='My <em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">overview</em>.' sub="Welcome back, Éloïse." />

      {/* Next visit card */}
      <div style={{
        background: 'var(--ink)', color: 'var(--surface)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 16,
        display: 'grid', gridTemplateColumns: '92px 1fr auto', gap: 24, alignItems: 'center',
        position: 'relative', boxShadow: 'var(--shadow-deep)',
      }}>
        <div style={{ position: 'absolute', top: 14, right: 18, background: 'var(--champagne)', color: '#1c1612', padding: '4px 12px', borderRadius: 99, fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Next</div>
        <div style={{ textAlign: 'center', borderRight: '1px solid rgba(243,236,224,.14)', paddingRight: 24, paddingTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--champagne)' }}>SAT</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 500, lineHeight: 1 }}>14</div>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(243,236,224,.55)' }}>JUN</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--champagne)', fontWeight: 500 }}>Upcoming visit</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, marginTop: 6 }}>Balayage Couture + Blowout</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(243,236,224,.7)', marginTop: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a575, #8a6d4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: '#fff', flexShrink: 0 }}>L</div>
            with Léa Dubois
          </div>
        </div>
        <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(243,236,224,.14)', paddingLeft: 24, paddingTop: 20 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 32, fontWeight: 500, color: 'var(--champagne)' }}>14:00</div>
          <div style={{ fontSize: 11, color: 'rgba(243,236,224,.5)', marginTop: 4 }}>2h 45m total</div>
          <button onClick={() => changeTab('upcoming')} style={{ marginTop: 16, border: '1px solid rgba(243,236,224,.18)', background: 'transparent', color: 'rgba(243,236,224,.75)', padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <SIcon name="calendar-clock" size={12} /> Manage
          </button>
        </div>
      </div>

      {/* Quick actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { icon: 'calendar-plus', label: 'Book a visit', action: () => {} },
          { icon: 'clock',         label: 'Visit history', action: () => changeTab('history') },
          { icon: 'gem',           label: 'Loyalty rewards', action: () => changeTab('loyalty') },
        ].map(({ icon, label, action }) => (
          <button key={label} onClick={action} style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)',
            padding: '18px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            transition: 'all .15s', boxShadow: 'var(--shadow-soft)',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--champagne)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--champagne-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-deep)' }}>
              <SIcon name={icon} size={18} />
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 450 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Loyalty bar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500 }}>
            Loyalty progress — <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>Maison</em>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>342 / 500 pts to Maître</div>
        </div>
        <div style={{ background: 'var(--surface-inset)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '68.4%', background: 'linear-gradient(to right, var(--champagne), var(--champagne-deep))', borderRadius: 99, transition: 'width .8s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.06em' }}>
          <span>0</span><span style={{ color: 'var(--champagne-deep)', fontWeight: 500 }}>342 pts</span><span>500</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Upcoming Tab ─── */
function UpcomingTab() {
  const appts = [
    { day: '14', mon: 'JUN', dow: 'SAT', next: true,  title: 'Balayage Couture + Blowout', stylist: 'Léa Dubois',  avatar: 'L', time: '14:00', dur: '2h 45m', ref: 'HRE-4A2K9', price: '€335' },
    { day: '28', mon: 'JUN', dow: 'SAT', next: false, title: 'Signature Cut',               stylist: 'Théo Roux',   avatar: 'T', time: '11:30', dur: '1h',     ref: 'HRE-7B1M3', price: '€78' },
  ]
  return (
    <div>
      <SectionTitle title='Upcoming <em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">visits</em>.' sub="2 appointments scheduled." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {appts.map((a, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 24, alignItems: 'stretch',
            background: a.next ? 'var(--ink)' : 'var(--surface)',
            border: `1px solid ${a.next ? 'transparent' : 'var(--line)'}`,
            borderRadius: 'var(--radius-lg)', padding: '22px 24px',
            color: a.next ? 'var(--surface)' : 'var(--ink)',
            position: 'relative', boxShadow: a.next ? 'var(--shadow-deep)' : 'var(--shadow-soft)',
          }}>
            {a.next && <div style={{ position: 'absolute', top: 14, right: 18, background: 'var(--champagne)', color: '#1c1612', padding: '4px 12px', borderRadius: 99, fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Next</div>}
            <div style={{ textAlign: 'center', borderRight: `1px solid ${a.next ? 'rgba(243,236,224,.14)' : 'var(--line)'}`, paddingRight: 24, paddingTop: a.next ? 18 : 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: a.next ? 'var(--champagne)' : 'var(--muted)' }}>{a.dow}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{a.day}</div>
              <div style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: a.next ? 'rgba(243,236,224,.55)' : 'var(--muted)' }}>{a.mon}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: a.next ? 'var(--champagne)' : 'var(--muted)', fontWeight: 500 }}>Appointment</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>{a.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: a.next ? 'rgba(243,236,224,.7)' : 'var(--muted)', marginTop: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a575, #8a6d4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: '#fff', flexShrink: 0 }}>{a.avatar}</div>
                with {a.stylist}
              </div>
              <div style={{ fontSize: 10.5, color: a.next ? 'rgba(243,236,224,.4)' : 'var(--muted-2)', marginTop: 10, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>Ref: {a.ref}</div>
            </div>
            <div style={{ borderLeft: `1px solid ${a.next ? 'rgba(243,236,224,.14)' : 'var(--line)'}`, paddingLeft: 24, paddingTop: a.next ? 18 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: 150 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, fontWeight: 500, color: a.next ? 'var(--champagne)' : 'var(--champagne-deep)' }}>{a.time}</div>
                <div style={{ fontSize: 11, color: a.next ? 'rgba(243,236,224,.5)' : 'var(--muted)', marginTop: 2 }}>{a.dur}</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--serif)', fontWeight: 500, color: a.next ? 'rgba(243,236,224,.7)' : 'var(--ink)', marginTop: 6 }}>{a.price}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                <button style={{ background: 'var(--champagne)', color: '#1c1612', border: 0, borderRadius: 'var(--radius)', padding: '9px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <SIcon name="calendar-clock" size={12} /> Reschedule
                </button>
                <button style={{ background: a.next ? 'rgba(243,236,224,.06)' : 'transparent', border: `1px solid ${a.next ? 'rgba(243,236,224,.12)' : 'rgba(168,74,58,.22)'}`, color: a.next ? 'rgba(243,236,224,.75)' : 'var(--danger)', borderRadius: 'var(--radius)', padding: '9px 14px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <SIcon name="x" size={12} /> Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', fontSize: 13.5, color: 'var(--muted)', textDecoration: 'none', transition: 'all .15s' }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--champagne)'; e.currentTarget.style.color = 'var(--champagne-deep)' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.color = 'var(--muted)' }}
      >
        <SIcon name="plus" size={16} /> Book another visit
      </Link>
    </div>
  )
}

/* ─── History Tab ─── */
function HistoryTab() {
  const rows = [
    { day: '12', mon: 'MAY', svc: 'Signature Cut',            stylist: 'T. Roux',    amt: '78',  status: 'paid' },
    { day: '28', mon: 'APR', svc: 'Balayage + Olaplex',       stylist: 'L. Dubois',  amt: '335', status: 'paid' },
    { day: '04', mon: 'APR', svc: 'Scalp Spa',                stylist: 'N. Hassan',  amt: '110', status: 'refund' },
    { day: '18', mon: 'MAR', svc: 'Royal Shave',              stylist: 'M. Voss',    amt: '55',  status: 'paid' },
    { day: '02', mon: 'MAR', svc: 'Signature Cut + Blowout',  stylist: 'T. Roux',    amt: '153', status: 'paid' },
    { day: '14', mon: 'FEB', svc: 'Keratin Treatment',        stylist: 'L. Dubois',  amt: '220', status: 'paid' },
  ]
  const statusStyle = {
    paid:   { bg: 'rgba(107,142,106,.12)', color: 'var(--success)' },
    refund: { bg: 'rgba(201,146,90,.12)',  color: 'var(--pending)' },
  }
  return (
    <div>
      <SectionTitle title='Visit <em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">history</em>.' sub={`${rows.length} past visits`} />
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px 90px 90px 44px', gap: 16, alignItems: 'center', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          <span>Date</span><span>Service</span><span>Stylist</span><span style={{ textAlign: 'right' }}>Amount</span><span>Status</span><span />
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px 90px 90px 44px', gap: 16, alignItems: 'center', padding: '16px 24px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, lineHeight: 1 }}>{r.day}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2 }}>{r.mon}</div>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500 }}>{r.svc}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.stylist}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>€{r.amt}</div>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 500, background: statusStyle[r.status]?.bg || 'var(--surface-inset)', color: statusStyle[r.status]?.color || 'var(--muted)' }}>
                {r.status}
              </span>
            </div>
            <button style={{ border: '1px solid var(--line)', background: 'transparent', borderRadius: 'var(--radius-sm)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}
              title="Download receipt"
            >
              <SIcon name="download" size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Payments Tab ─── */
function PaymentsTab() {
  const transactions = [
    { day: '12', mon: 'MAY', desc: 'Signature Cut — T. Roux',          amt: '-€78',  type: 'debit' },
    { day: '28', mon: 'APR', desc: 'Balayage + Olaplex — L. Dubois',   amt: '-€335', type: 'debit' },
    { day: '04', mon: 'APR', desc: 'Refund: Scalp Spa',                amt: '+€110', type: 'credit' },
    { day: '18', mon: 'MAR', desc: 'Royal Shave — M. Voss',            amt: '-€55',  type: 'debit' },
  ]
  return (
    <div>
      <SectionTitle title='<em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">Payments</em> &amp; cards.' />

      {/* Card + YTD stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Credit card visual */}
        <div style={{ background: 'linear-gradient(135deg, #d4b481 0%, #b89968 55%, #8a6d4a 100%)', color: '#1c1612', borderRadius: 'var(--radius-lg)', padding: '26px 28px', position: 'relative', overflow: 'hidden', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-deep)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 0%, rgba(255,255,255,.18), transparent 50%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(28,22,18,.65)' }}>Maison Gold</div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 22 }}>Haire.</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 17, letterSpacing: '0.22em', position: 'relative', zIndex: 1 }}>•••• •••• •••• 4821</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>Éloïse Martin</div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.6 }}>12 / 27</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', flex: 1, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>YTD spend</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
              4 280<em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)', fontSize: 24 }}>€</em>
            </div>
            <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <SIcon name="trending-up" size={12} /> +12% vs. last year
            </div>
          </div>
          <button style={{ border: '1px dashed var(--line-strong)', background: 'transparent', borderRadius: 'var(--radius-lg)', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12.5, color: 'var(--muted)', transition: 'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--champagne)'; e.currentTarget.style.color = 'var(--champagne-deep)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <SIcon name="plus" size={14} /> Add payment method
          </button>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500 }}>Recent <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>transactions</em></div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>•••• 4821</div>
        </div>
        {transactions.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < transactions.length - 1 ? '1px solid var(--line)' : 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius)', background: t.type === 'credit' ? 'rgba(107,142,106,.10)' : 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.type === 'credit' ? 'var(--success)' : 'var(--muted)', flexShrink: 0 }}>
              <SIcon name={t.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 450 }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.day} {t.mon} 2026</div>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: t.type === 'credit' ? 'var(--success)' : 'var(--ink)', textAlign: 'right' }}>{t.amt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Loyalty Tab ─── */
function LoyaltyTab() {
  const tiers = [
    { name: 'Initiée',  pts: '0 – 200 pts',  desc: 'Welcome to the Maison. Priority booking access and exclusive member communications.' },
    { name: 'Maison',   pts: '200 – 500 pts', desc: '8% back on every visit, private event invitations, and early access to new services.', current: true },
    { name: 'Maître',   pts: '500+ pts',      desc: 'Complimentary treatments each quarter, dedicated concierge line, and seasonal gifts.' },
  ]
  const perks = [
    { icon: 'calendar-plus', label: 'Priority booking', desc: 'First access to prime-time slots' },
    { icon: 'gift',          label: 'Birthday reward',  desc: 'Complimentary treatment every year' },
    { icon: 'zap',           label: 'Flash offers',     desc: 'Exclusive member-only discounts' },
    { icon: 'bell',          label: 'Early access',     desc: 'New services before they launch' },
  ]
  return (
    <div>
      <SectionTitle title='Your <em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">loyalty</em> programme.' sub="342 points · Maison tier" />

      {/* Progress card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>Progress to <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>Maître</em></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>342 / 500 pts</div>
        </div>
        <div style={{ background: 'var(--surface-inset)', borderRadius: 99, height: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '68.4%', background: 'linear-gradient(to right, var(--champagne), var(--champagne-deep))', borderRadius: 99, transition: 'width .8s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.06em' }}>
          <span>200</span>
          <span style={{ color: 'var(--champagne-deep)', fontWeight: 500 }}>342 pts current</span>
          <span>500</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>158 more points to reach <span style={{ color: 'var(--champagne-deep)', fontWeight: 500 }}>Maître</span>. Book your next visit to progress.</div>
      </div>

      {/* Perks grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {perks.map(p => (
          <div key={p.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '18px 16px', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--champagne-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-deep)', margin: '0 auto 10px' }}>
              <SIcon name={p.icon} size={18} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Tier cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tiers.map((t, i) => (
          <div key={i} style={{ background: t.current ? 'var(--ink)' : 'var(--surface)', border: `1px solid ${t.current ? 'transparent' : 'var(--line)'}`, borderRadius: 'var(--radius-lg)', padding: '22px 24px', color: t.current ? 'var(--surface)' : 'var(--ink)', boxShadow: t.current ? 'var(--shadow-deep)' : 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                {t.name}
                {t.current && <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--champagne)', color: '#1c1612', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Current</span>}
              </div>
              <div style={{ fontSize: 11.5, color: t.current ? 'rgba(243,236,224,.55)' : 'var(--muted)', fontFamily: 'var(--mono)' }}>{t.pts}</div>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: t.current ? 'rgba(243,236,224,.75)' : 'var(--muted)', lineHeight: 1.55 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  function handleSave(setSt) {
    setSt(true)
    setTimeout(() => setSt(false), 2200)
  }

  return (
    <div>
      <SectionTitle title='My <em style="font-style:italic;font-weight:400;color:var(--champagne-deep)">profile</em>.' />

      {/* Personal details */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500 }}>Personal <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>details</em></h4>
          {saved && <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}><SIcon name="check" size={13} /> Saved</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="First name"    value="Éloïse" />
          <Field label="Last name"     value="Martin" />
          <Field label="Email"         value="eloise@example.com" type="email" />
          <Field label="Phone"         value="+33 6 00 00 00 00"  type="tel" />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Address" value="14 Rue du Faubourg Saint-Honoré, 75008 Paris" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <ChipBtn icon="save" onClick={() => handleSave(setSaved)}>Save changes</ChipBtn>
          <ChipBtn variant="ghost">Cancel</ChipBtn>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
        <h4 style={{ margin: '0 0 20px', fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500 }}>Communication <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>preferences</em></h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Appointment reminders', desc: 'Receive reminders 24h and 2h before each visit', checked: true },
            { label: 'Loyalty updates',       desc: 'Points earned, tier changes, and reward alerts', checked: true },
            { label: 'Promotional offers',    desc: 'Exclusive member offers and seasonal promotions',  checked: false },
            { label: 'Newsletter',            desc: 'Monthly editorial and style inspiration',           checked: false },
          ].map(p => (
            <label key={p.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={p.checked} style={{ accentColor: 'var(--champagne-deep)', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 450 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h4 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500 }}>Change <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>password</em></h4>
          {pwSaved && <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}><SIcon name="check" size={13} /> Updated</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Current password" type="password" value="••••••••" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="New password"     type="password" value="" />
            <Field label="Confirm password" type="password" value="" />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <ChipBtn icon="lock" onClick={() => handleSave(setPwSaved)}>Update password</ChipBtn>
        </div>
      </div>
    </div>
  )
}
