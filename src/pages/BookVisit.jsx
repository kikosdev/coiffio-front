import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import SIcon from '../components/SIcon'
import TopNav from '../components/TopNav'

/* ─── Data ─── */
const SERVICES = [
  { id: 1, cat: 'Cuts',       icon: 'scissors',    name: 'The Signature Cut',    dur: 60,  price: 78,  stylists: [1, 2, 3],    audience: 'all',   desc: 'Our hallmark precision haircut, tailored to your face shape.' },
  { id: 2, cat: 'Cuts',       icon: 'scissors',    name: 'Balayage Couture',     dur: 150, price: 240, stylists: [1],          audience: 'women', desc: 'Hand-painted highlights for a natural sun-kissed finish.' },
  { id: 3, cat: 'Cuts',       icon: 'scissors',    name: 'Colour & Highlights',  dur: 120, price: 160, stylists: [1, 3],       audience: 'women', desc: 'Full-spectrum colour with tonal blending and gloss seal.' },
  { id: 4, cat: 'Grooming',   icon: 'user',        name: 'Beard Sculpt',         dur: 45,  price: 75,  stylists: [2],          audience: 'men',   desc: 'Defined lines, shape and conditioning treatment.' },
  { id: 5, cat: 'Grooming',   icon: 'user',        name: 'Royal Shave',          dur: 30,  price: 55,  stylists: [2],          audience: 'men',   desc: 'Traditional hot-towel straight-razor shave with facial massage.' },
  { id: 6, cat: 'Treatments', icon: 'sparkles',    name: 'Scalp Spa',            dur: 60,  price: 110, stylists: [1, 4],       audience: 'all',   desc: 'Deep-cleansing ritual to restore scalp balance and hydration.' },
  { id: 7, cat: 'Treatments', icon: 'sparkles',    name: 'Olaplex Bond',         dur: 45,  price: 95,  stylists: [1, 3, 4],    audience: 'all',   desc: 'Molecular repair treatment for damaged or over-processed hair.' },
  { id: 8, cat: 'Styling',    icon: 'wind',        name: 'Blowout & Finish',     dur: 45,  price: 75,  stylists: [1, 3, 4],    audience: 'all',   desc: 'Salon-perfect blowdry with finishing serum and hold spray.' },
]

const STYLISTS = [
  { id: 1, name: 'Léa Dubois',    role: 'Master Colourist',       tone: 'ph-3', tag: 'Master', shift: [10, 20], exp: '12 years', bio: 'Specialist in colour, balayage and keratin treatments.' },
  { id: 2, name: 'Marcus Voss',   role: "Men's Grooming Lead",    tone: 'ph-7', tag: 'Senior', shift: [10, 18], exp: '8 years',  bio: 'Expert in precision cuts, shaving and beard design.' },
  { id: 3, name: 'Théo Roux',     role: 'Senior Stylist',         tone: 'ph-2', tag: 'Senior', shift: [11, 20], exp: '6 years',  bio: 'Known for editorial styling and creative colour work.' },
  { id: 4, name: 'Nadia Hassan',  role: 'Treatment Specialist',   tone: 'ph-5', tag: 'Master', shift: [10, 19], exp: '10 years', bio: 'Dedicated to scalp health, Olaplex and restorative care.' },
]

const DATES = [
  { label: 'Mon', num: '9',  month: 'Jun' },
  { label: 'Tue', num: '10', month: 'Jun' },
  { label: 'Wed', num: '11', month: 'Jun' },
  { label: 'Thu', num: '12', month: 'Jun' },
  { label: 'Fri', num: '13', month: 'Jun' },
  { label: 'Sat', num: '14', month: 'Jun' },
  { label: 'Sun', num: '15', month: 'Jun', closed: true },
]

const TIME_SLOTS = [
  '10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00',
]

const STEPS = ['Services', 'Stylist', 'Time', 'Confirm']

/* ─── Root ─── */
export default function BookVisit() {
  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedStylist, setSelectedStylist] = useState(null)
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [confirmed, setConfirmed] = useState(false)
  const [refCode] = useState(() => `HRE-${Math.random().toString(36).slice(2,8).toUpperCase()}`)
  const mainRef = useRef(null)

  const totalDur   = selectedServices.reduce((s, id) => s + (SERVICES.find(x => x.id === id)?.dur   || 0), 0)
  const totalPrice = selectedServices.reduce((s, id) => s + (SERVICES.find(x => x.id === id)?.price || 0), 0)
  const qualifiedStylists = STYLISTS.filter(st =>
    selectedServices.every(id => SERVICES.find(x => x.id === id)?.stylists.includes(st.id))
  )

  const canAdvance =
    (step === 1 && selectedServices.length > 0) ||
    (step === 2 && selectedStylist) ||
    (step === 3 && selectedSlot)

  function goTo(n) {
    setStep(n)
    setAnimKey(k => k + 1)
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function advance() { if (canAdvance) goTo(step + 1) }
  function back()    { if (step > 1) goTo(step - 1) }

  function toggleService(id) {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    setSelectedStylist(null)
    setSelectedSlot(null)
  }

  if (confirmed) return <ConfirmScreen refCode={refCode} totalPrice={totalPrice} />

  const stylist = STYLISTS.find(s => s.id === selectedStylist)
  const date    = DATES[selectedDate]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TopNav />

      {/* ── Step bar ── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '0 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'stretch' }}>
          {STEPS.map((label, i) => {
            const num      = i + 1
            const isCurr   = step === num
            const isDone   = step > num
            const canClick = isDone
            return (
              <button key={i} onClick={() => canClick && goTo(num)}
                style={{
                  flex: 1, padding: '20px 0', border: 0, borderBottom: isCurr ? '2px solid var(--ink)' : '2px solid transparent',
                  background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: canClick ? 'pointer' : 'default', transition: 'all .2s',
                }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: isDone ? 'var(--champagne)' : isCurr ? 'var(--ink)' : 'var(--surface-inset)',
                  border: isDone ? 'none' : isCurr ? 'none' : '1px solid var(--line-strong)',
                  color: isDone ? '#1c1612' : isCurr ? 'var(--surface)' : 'var(--muted)',
                  fontSize: 11, fontWeight: 600, transition: 'all .2s',
                }}>
                  {isDone ? <SIcon name="check" size={11} /> : <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13 }}>{num}</span>}
                </div>
                <span style={{
                  fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                  color: isCurr ? 'var(--ink)' : isDone ? 'var(--champagne-deep)' : 'var(--muted)',
                  transition: 'color .2s',
                }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, padding: '56px 56px 100px', alignItems: 'start' }}>

        {/* Main content */}
        <div ref={mainRef} key={animKey} className="fade-up">
          {step === 1 && (
            <StepServices
              services={SERVICES} selected={selectedServices} toggle={toggleService}
              filter={audienceFilter} setFilter={setAudienceFilter}
            />
          )}
          {step === 2 && (
            <StepStylist
              stylists={STYLISTS} qualified={qualifiedStylists}
              selected={selectedStylist} onSelect={setSelectedStylist}
            />
          )}
          {step === 3 && (
            <StepTime
              dates={DATES} selectedDateIdx={selectedDate} setDateIdx={d => { setSelectedDate(d); setSelectedSlot(null) }}
              slots={TIME_SLOTS} selected={selectedSlot} onSelect={setSelectedSlot}
              stylist={stylist} totalDur={totalDur}
            />
          )}
          {step === 4 && (
            <StepConfirm
              services={selectedServices.map(id => SERVICES.find(s => s.id === id))}
              stylist={stylist} date={date} slot={selectedSlot} total={totalPrice}
              onConfirm={() => setConfirmed(true)}
            />
          )}

          {/* Back / Continue row (under content) */}
          {step < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
              <button onClick={back} style={{
                border: '1px solid var(--line)', background: 'transparent', color: step === 1 ? 'var(--muted-2)' : 'var(--ink-soft)',
                padding: '11px 20px', borderRadius: 'var(--radius)', fontSize: 13, cursor: step === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, opacity: step === 1 ? 0.4 : 1, transition: 'all .15s',
              }}>
                <SIcon name="arrow-left" size={14} /> Back
              </button>
              <button onClick={advance} disabled={!canAdvance} style={{
                border: 0, background: canAdvance ? 'var(--ink)' : 'var(--surface-inset)',
                color: canAdvance ? 'var(--surface)' : 'var(--muted)',
                padding: '12px 28px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
                cursor: canAdvance ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all .2s', boxShadow: canAdvance ? 'var(--shadow-card)' : 'none',
              }}>
                Continue <SIcon name="arrow-right" size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar summary ── */}
        <Sidebar
          services={selectedServices.map(id => SERVICES.find(s => s.id === id))}
          stylist={stylist} date={date} slot={selectedSlot}
          totalDur={totalDur} totalPrice={totalPrice}
          step={step} canAdvance={canAdvance} advance={advance}
        />
      </div>
    </div>
  )
}

/* ─── Sidebar ─── */
function Sidebar({ services, stylist, date, slot, totalDur, totalPrice, step, canAdvance, advance }) {
  const durH = Math.floor(totalDur / 60)
  const durM = totalDur % 60
  const durStr = durH > 0 ? `${durH}h${durM > 0 ? ` ${durM}m` : ''}` : `${durM}m`

  return (
    <div style={{ position: 'sticky', top: 96 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Booking <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>summary</em>
          </h3>
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* Services list */}
          {services.length === 0 ? (
            <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
              <SIcon name="scissors" size={22} style={{ opacity: .3, display: 'block', margin: '0 auto 8px' }} />
              Select services to begin
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {services.map((svc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < services.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--ink)' }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{svc.dur} min</div>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--champagne-deep)', flexShrink: 0, marginLeft: 12 }}>€{svc.price}</div>
                </div>
              ))}

              {/* Duration bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>Total duration</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{durStr}</span>
                </div>
                <div style={{ background: 'var(--surface-inset)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (totalDur / 180) * 100)}%`, background: 'linear-gradient(to right, var(--champagne), var(--champagne-deep))', borderRadius: 99, transition: 'width .5s ease' }} />
                </div>
              </div>

              {/* Price total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total</span>
                <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30, fontWeight: 500, color: 'var(--ink)' }}>€{totalPrice}</span>
              </div>
            </div>
          )}

          {/* Progressive details: stylist */}
          {stylist && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 10 }}>Stylist</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={`ph ${stylist.tone}`} style={{ width: 36, height: 36, borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,.9)', zIndex: 2 }}>{stylist.name[0]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 450 }}>{stylist.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{stylist.role}</div>
                </div>
              </div>
            </div>
          )}

          {/* Date + time */}
          {slot && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>Date</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{date.label} {date.num} {date.month}</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>Time</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--champagne-deep)' }}>{slot}</div>
              </div>
            </div>
          )}
        </div>

        {/* Continue CTA */}
        {step < 4 && (
          <div style={{ padding: '0 24px 24px' }}>
            <button onClick={advance} disabled={!canAdvance} style={{
              width: '100%', background: canAdvance ? 'var(--ink)' : 'var(--surface-inset)',
              color: canAdvance ? 'var(--surface)' : 'var(--muted)',
              border: 0, borderRadius: 'var(--radius)', padding: '14px', fontSize: 13.5, fontWeight: 500,
              cursor: canAdvance ? 'pointer' : 'not-allowed', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canAdvance ? 'var(--shadow-soft)' : 'none',
            }}>
              Continue <SIcon name="arrow-right" size={14} />
            </button>
          </div>
        )}

        {/* Pay-on-arrival note */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SIcon name="shield-check" size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>No payment required today. Settle on arrival.</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 1: Services ─── */
function StepServices({ services, selected, toggle, filter, setFilter }) {
  const filters = [
    { key: 'all',   label: 'All services' },
    { key: 'women', label: 'Women' },
    { key: 'men',   label: 'Men' },
  ]
  const filtered = filter === 'all' ? services : services.filter(s => s.audience === filter || s.audience === 'all')
  const cats = [...new Set(filtered.map(s => s.cat))]
  const catIcons = { Cuts: 'scissors', Grooming: 'user', Treatments: 'sparkles', Styling: 'wind' }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1 }}>
          Choose your <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>services</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Select one or more. Your total duration and price update instantly.</p>
      </div>

      {/* Audience filter pill */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-inset)', border: '1px solid var(--line)', borderRadius: 99, padding: 4, width: 'fit-content', marginBottom: 36 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 18px', borderRadius: 99, border: 0, fontSize: 12.5, fontWeight: 500,
            background: filter === f.key ? 'var(--surface)' : 'transparent',
            color: filter === f.key ? 'var(--ink)' : 'var(--muted)',
            boxShadow: filter === f.key ? 'var(--shadow-soft)' : 'none',
            cursor: 'pointer', transition: 'all .2s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Service groups */}
      {cats.map(cat => (
        <div key={cat} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--champagne-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-deep)' }}>
              <SIcon name={catIcons[cat] || 'star'} size={13} />
            </div>
            <span style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--champagne-deep)', fontWeight: 600 }}>{cat}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.filter(s => s.cat === cat).map(svc => {
              const isSel = selected.includes(svc.id)
              return (
                <div key={svc.id} onClick={() => toggle(svc.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    alignItems: 'center', gap: 20,
                    padding: '18px 22px',
                    background: isSel ? 'var(--ink)' : 'var(--surface)',
                    border: `1px solid ${isSel ? 'transparent' : 'var(--line)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    transition: 'all .2s', color: isSel ? 'var(--surface)' : 'var(--ink)',
                    boxShadow: isSel ? 'var(--shadow-deep)' : 'var(--shadow-soft)',
                  }}
                  onMouseOver={e => !isSel && (e.currentTarget.style.borderColor = 'var(--champagne)')}
                  onMouseOut={e => !isSel && (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, marginBottom: 4 }}>{svc.name}</div>
                    <div style={{ fontSize: 12.5, color: isSel ? 'rgba(243,236,224,.65)' : 'var(--muted)', lineHeight: 1.45 }}>{svc.desc}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: isSel ? 'rgba(243,236,224,.5)' : 'var(--muted-2)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><SIcon name="clock" size={11} />{svc.dur} min</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><SIcon name="user" size={11} />{svc.stylists.length} stylist{svc.stylists.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: isSel ? 'var(--champagne)' : 'var(--champagne-deep)' }}>€{svc.price}</span>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSel ? 'var(--champagne)' : 'transparent',
                      border: `2px solid ${isSel ? 'var(--champagne)' : 'var(--line-strong)'}`,
                      transition: 'all .2s',
                    }}>
                      {isSel && <SIcon name="check" size={12} style={{ color: '#1c1612' }} />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Step 2: Stylist ─── */
function StepStylist({ stylists, qualified, selected, onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1 }}>
          Choose your <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>stylist</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Only stylists trained in all your selected services are available to book.</p>
      </div>

      {qualified.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', color: 'var(--muted)', fontSize: 13.5, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <SIcon name="info" size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>No single stylist covers all your chosen services. Try adjusting your selection or book a separate appointment.</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stylists.map(s => {
          const isQual = qualified.some(q => q.id === s.id)
          const isSel  = selected === s.id
          return (
            <div key={s.id}
              onClick={() => isQual && onSelect(s.id)}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 20, alignItems: 'center',
                padding: '20px 24px',
                background: isSel ? 'var(--ink)' : isQual ? 'var(--surface)' : 'var(--surface-2)',
                border: `1px solid ${isSel ? 'transparent' : isQual ? 'var(--line)' : 'var(--line)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: isQual ? 'pointer' : 'not-allowed',
                opacity: isQual ? 1 : 0.45,
                transition: 'all .2s',
                color: isSel ? 'var(--surface)' : 'var(--ink)',
                boxShadow: isSel ? 'var(--shadow-deep)' : isQual ? 'var(--shadow-soft)' : 'none',
              }}
              onMouseOver={e => isQual && !isSel && (e.currentTarget.style.borderColor = 'var(--champagne)')}
              onMouseOut={e => isQual && !isSel && (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              {/* Avatar */}
              <div className={`ph ${s.tone}`} style={{ width: 72, height: 72, borderRadius: '50%', position: 'relative', flexShrink: 0, boxShadow: isSel ? '0 0 0 3px var(--champagne)' : 'none', transition: 'box-shadow .2s' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30, color: 'rgba(255,255,255,.9)', zIndex: 2 }}>{s.name[0]}</div>
              </div>

              {/* Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 500 }}>{s.name}</div>
                  <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', background: isSel ? 'var(--champagne)' : 'var(--champagne-soft)', color: isSel ? '#1c1612' : 'var(--champagne-deep)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{s.tag}</span>
                </div>
                <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: isSel ? 'var(--champagne)' : 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>{s.role}</div>
                <div style={{ fontSize: 12.5, color: isSel ? 'rgba(243,236,224,.65)' : 'var(--muted)', lineHeight: 1.45, marginBottom: 8 }}>{s.bio}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: isSel ? 'rgba(243,236,224,.5)' : 'var(--muted-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><SIcon name="clock" size={11} />{s.shift[0]}:00 – {s.shift[1]}:00</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><SIcon name="star" size={11} />{s.exp} experience</span>
                </div>
              </div>

              {/* Check */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSel ? 'var(--champagne)' : 'transparent',
                border: `2px solid ${isSel ? 'var(--champagne)' : 'var(--line-strong)'}`,
                transition: 'all .2s', flexShrink: 0,
              }}>
                {isSel && <SIcon name="check" size={12} style={{ color: '#1c1612' }} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Step 3: Time ─── */
function StepTime({ dates, selectedDateIdx, setDateIdx, slots, selected, onSelect, stylist, totalDur }) {
  const durH = Math.floor(totalDur / 60)
  const durM = totalDur % 60
  const durStr = durH > 0 ? `${durH}h${durM > 0 ? ` ${durM}m` : ''}` : `${durM}m`

  const groups = [
    { label: 'Morning',   icon: 'sunrise',  times: slots.filter(t => parseInt(t) < 12) },
    { label: 'Afternoon', icon: 'sun',      times: slots.filter(t => parseInt(t) >= 12 && parseInt(t) < 17) },
    { label: 'Evening',   icon: 'sunset',   times: slots.filter(t => parseInt(t) >= 17) },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1 }}>
          Pick a <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>time</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Showing slots with a continuous {durStr} block for {stylist?.name}.
        </p>
      </div>

      {/* Month label */}
      <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--champagne-deep)', fontWeight: 600, marginBottom: 12 }}>June 2026</div>

      {/* Date tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 36 }}>
        {dates.map((d, i) => {
          const isSel    = selectedDateIdx === i
          const isClosed = d.closed
          return (
            <button key={i}
              onClick={() => !isClosed && setDateIdx(i)}
              disabled={isClosed}
              style={{
                padding: '12px 6px', border: `1px solid ${isSel ? 'var(--ink)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)', background: isSel ? 'var(--ink)' : isClosed ? 'var(--surface-2)' : 'var(--surface)',
                color: isSel ? 'var(--surface)' : isClosed ? 'var(--muted-2)' : 'var(--ink)',
                cursor: isClosed ? 'not-allowed' : 'pointer', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: isClosed ? 0.45 : 1,
                boxShadow: isSel ? 'var(--shadow-soft)' : 'none',
              }}>
              <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: isSel ? 'var(--champagne)' : 'var(--muted)', fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{d.num}</span>
              {isClosed && <span style={{ fontSize: 9, color: 'var(--muted-2)' }}>Closed</span>}
            </button>
          )
        })}
      </div>

      {/* Time slot groups */}
      {groups.map(g => g.times.length > 0 && (
        <div key={g.label} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SIcon name={g.icon} size={13} style={{ color: 'var(--champagne-deep)' }} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{g.label}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {g.times.map(slot => {
              const isSel = selected === slot
              return (
                <button key={slot} onClick={() => onSelect(slot)} style={{
                  padding: '12px 8px', border: `1px solid ${isSel ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', background: isSel ? 'var(--ink)' : 'var(--surface)',
                  color: isSel ? 'var(--surface)' : 'var(--ink)',
                  fontSize: 13.5, fontFamily: 'var(--mono)', letterSpacing: '0.04em',
                  cursor: 'pointer', transition: 'all .15s', fontWeight: isSel ? 500 : 400,
                  boxShadow: isSel ? 'var(--shadow-soft)' : 'none',
                }}
                onMouseOver={e => !isSel && (e.currentTarget.style.borderColor = 'var(--champagne)')}
                onMouseOut={e => !isSel && (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Step 4: Confirm ─── */
function StepConfirm({ services, stylist, date, slot, total, onConfirm }) {
  const [agreed, setAgreed] = useState(false)
  const durTotal = services.reduce((s, svc) => s + svc.dur, 0)
  const durH = Math.floor(durTotal / 60)
  const durM = durTotal % 60

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1 }}>
          Confirm your <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>visit</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Review the details below. No payment is taken today.</p>
      </div>

      {/* Booking card */}
      <div style={{ background: 'var(--ink)', borderRadius: 'var(--radius-xl)', padding: '32px 36px', color: 'var(--surface)', marginBottom: 28, boxShadow: 'var(--shadow-deep)' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--champagne)', fontWeight: 600, marginBottom: 20 }}>Booking details</div>

        {/* Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {services.map((svc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(243,236,224,.10)' }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>{svc.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(243,236,224,.5)', marginTop: 3 }}>{svc.dur} min</div>
              </div>
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--champagne)' }}>€{svc.price}</span>
            </div>
          ))}
        </div>

        {/* Stylist + Date/Time row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 22 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(243,236,224,.45)', marginBottom: 6 }}>Stylist</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{stylist?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(243,236,224,.45)', marginTop: 3 }}>{stylist?.role}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(243,236,224,.45)', marginBottom: 6 }}>Date</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{date?.label} {date?.num} {date?.month}</div>
            <div style={{ fontSize: 11, color: 'rgba(243,236,224,.45)', marginTop: 3 }}>2026</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(243,236,224,.45)', marginBottom: 6 }}>Time</div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--champagne)' }}>{slot}</div>
            <div style={{ fontSize: 11, color: 'rgba(243,236,224,.45)', marginTop: 3 }}>{durH > 0 ? `${durH}h` : ''}{durM > 0 ? ` ${durM}m` : ''} total</div>
          </div>
        </div>

        {/* Total */}
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(243,236,224,.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(243,236,224,.6)' }}>Total — pay on arrival</span>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 34, fontWeight: 500, color: 'var(--champagne)' }}>€{total}</span>
        </div>
      </div>

      {/* Contact form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', marginBottom: 20, boxShadow: 'var(--shadow-soft)' }}>
        <h4 style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500 }}>Your <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>contact details</em></h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="First name"       placeholder="Éloïse" />
          <Field label="Last name"        placeholder="Martin" />
          <Field label="Email"            placeholder="eloise@example.com" type="email" />
          <Field label="Phone"            placeholder="+33 6 00 00 00 00"  type="tel" />
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Notes (optional)" placeholder="Allergies, special requests, or anything we should know…" />
        </div>
      </div>

      {/* Terms */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', marginBottom: 22, lineHeight: 1.55 }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--champagne-deep)', width: 15, height: 15, flexShrink: 0 }} />
        I accept the cancellation policy: appointments may be cancelled free of charge up to 24 hours before the scheduled visit.
      </label>

      {/* Confirm button */}
      <button onClick={onConfirm} disabled={!agreed} style={{
        width: '100%', background: agreed ? 'var(--ink)' : 'var(--surface-inset)',
        color: agreed ? 'var(--surface)' : 'var(--muted)',
        border: 0, borderRadius: 'var(--radius)', padding: '17px', fontSize: 14, fontWeight: 500,
        cursor: agreed ? 'pointer' : 'not-allowed', transition: 'all .2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: agreed ? 'var(--shadow-card)' : 'none',
        letterSpacing: '0.02em',
      }}>
        <SIcon name="check-circle" size={16} /> Confirm my visit
      </button>
    </div>
  )
}

/* ─── Confirmation screen ─── */
function ConfirmScreen({ refCode, totalPrice }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 48px' }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          {/* Check circle */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--champagne)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(184,153,104,.35)' }}>
            <SIcon name="check" size={34} style={{ color: '#1c1612' }} />
          </div>

          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 16px' }}>
            See you <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>soon</em>.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            Your appointment is confirmed. A confirmation has been sent to your email and a reminder will follow 24 hours before your visit.
          </p>

          {/* Reference card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 36, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>Booking reference</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--ink)', letterSpacing: '0.12em' }}>{refCode}</div>
              </div>
              <div style={{ background: 'var(--line)', height: '100%' }} />
              <div>
                <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>Total due</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, fontWeight: 500, color: 'var(--champagne-deep)' }}>€{totalPrice}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>Pay on arrival</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/account" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--ink)', color: 'var(--surface)', textDecoration: 'none',
              padding: '12px 24px', borderRadius: 'var(--radius)', fontSize: 13.5, fontWeight: 500,
              boxShadow: 'var(--shadow-soft)',
            }}>
              <SIcon name="user" size={14} /> View my account
            </Link>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--line)', color: 'var(--ink-soft)', textDecoration: 'none',
              padding: '12px 24px', borderRadius: 'var(--radius)', fontSize: 13.5, background: 'var(--surface)',
            }}>
              Back to Maison Haire <SIcon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Field ─── */
function Field({ label, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        style={{
          background: 'var(--surface-inset)', border: '1px solid var(--line)',
          padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 14,
          color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--champagne)'; e.target.style.boxShadow = '0 0 0 3px var(--champagne-soft)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}
