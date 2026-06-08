import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SIcon from '../components/SIcon'
import { connectSocket } from '../services/socket'
import styles from './SignIn.module.css'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

export default function SignIn() {
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')

    // Try real API login first
    if (email && password) {
      try {
        setLoading(true)
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('haire_token', data.access_token)
          localStorage.setItem('haire_role', data.user.role)
          connectSocket()
          if (data.user.role === 'owner' || data.user.role === 'supervisor' || data.user.role === 'staff') {
            navigate('/dashboard')
          } else {
            navigate('/account')
          }
          return
        } else {
          const err = await res.json()
          setError(err.message || 'Invalid credentials')
          setLoading(false)
          return
        }
      } catch {
        // API unavailable — fall through to mock mode
      } finally {
        setLoading(false)
      }
    }

    // Prototype fallback (no API)
    if (tab === 'owner') {
      localStorage.setItem('haire_role', 'owner')
      navigate('/dashboard')
    } else if (tab === 'signin') {
      localStorage.setItem('haire_role', 'client')
      navigate('/account')
    } else {
      navigate('/')
    }
  }

  const isOwner = tab === 'owner'

  return (
    <div className={styles.page}>
      {/* Art panel */}
      <div className={styles.artPanel}>
        <div className={`ph ${isOwner ? 'ph-7' : 'ph-3'}`} style={{ position: 'absolute', inset: 0, opacity: 0.7, transition: 'all .4s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,16,12,.4) 0%, rgba(20,16,12,.92) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, color: 'var(--surface)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Haire<span style={{ color: 'var(--champagne)' }}>.</span>
          </Link>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(243,236,224,.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SIcon name="arrow-left" size={14} /> Back to site
          </Link>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 80, letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 24 }}>
            Haire<span style={{ color: 'var(--champagne)' }}>.</span>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', maxWidth: 460 }}>
            {isOwner
              ? <>Manage your <em style={{ fontStyle: 'italic', color: 'var(--champagne)' }}>Maison</em>.</>
              : <>The salon that <em style={{ fontStyle: 'italic', color: 'var(--champagne)' }}>remembers</em> you.</>}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2, fontSize: 12, color: 'rgba(243,236,224,.55)', letterSpacing: '0.08em' }}>
          MAISON HAIRE · PARIS · EST. 2014
        </div>
      </div>

      {/* Form panel */}
      <div className={styles.formPanel}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-inset)', border: '1px solid var(--line)', borderRadius: 99, padding: 4, marginBottom: 36, width: 'fit-content' }}>
          {[
            { key: 'signin',   label: 'Sign in' },
            { key: 'register', label: 'Register' },
            { key: 'owner',    label: 'Owner access' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? (t.key === 'owner' ? 'var(--champagne-deep)' : 'var(--ink)') : 'transparent',
              color: tab === t.key ? 'var(--surface)' : 'var(--muted)',
              border: 0, padding: '9px 16px', borderRadius: 99,
              fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
              cursor: 'pointer', transition: 'all .25s ease', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.key === 'owner' && <SIcon name="shield" size={13} />}
              {t.label}
            </button>
          ))}
        </div>

        {isOwner ? (
          /* ── Owner form ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--champagne-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-deep)' }}>
                <SIcon name="layout-dashboard" size={20} />
              </div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--champagne-deep)', fontWeight: 600 }}>Salon management portal</div>
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, margin: '0 0 14px' }}>
              Owner <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>access</em>.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.55, margin: '0 0 32px', maxWidth: 440 }}>
              Sign in to manage appointments, stylists, revenue analytics, and all salon operations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Owner email" placeholder="owner@salon.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Field label="Password" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontSize: 13 }}>
              <a href="#" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Forgot password?</a>
            </div>
            {error && (
              <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(168,74,58,.08)', border: '1px solid rgba(168,74,58,.22)', borderRadius: 'var(--radius-sm)', fontSize: 12.5, color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 16, width: '100%', background: 'var(--champagne-deep)', color: '#fff',
                border: 0, borderRadius: 'var(--radius)', padding: '16px 22px', fontSize: 14,
                fontWeight: 500, letterSpacing: '0.02em', cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all .2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 18px rgba(142,113,66,.28)',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#7a6138' }}
              onMouseOut={e => e.currentTarget.style.background = 'var(--champagne-deep)'}
            >
              <SIcon name="layout-dashboard" size={15} />
              {loading ? 'Signing in…' : 'Enter dashboard'}
            </button>
            <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(184,153,104,.08)', border: '1px solid rgba(184,153,104,.25)', borderRadius: 'var(--radius)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <SIcon name="info" size={14} style={{ color: 'var(--champagne-deep)', flexShrink: 0, marginTop: 1 }} />
              <span>Owner accounts are created by Maison Haire. Contact <strong style={{ color: 'var(--champagne-deep)' }}>support@haire.fr</strong> to request access.</span>
            </div>
          </>
        ) : (
          /* ── Client form ── */
          <>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 56, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, margin: '0 0 14px' }}>
              {tab === 'signin' ? <>Welcome <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>back</em>.</> : <>Join the <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)' }}>Maison</em>.</>}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.55, margin: '0 0 32px', maxWidth: 440 }}>
              {tab === 'signin'
                ? 'Sign in to access your appointments, loyalty points, and saved preferences.'
                : 'Create a free account to book faster, earn 8% back on every visit, and unlock private events.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tab === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="First name" placeholder="Éloïse" />
                  <Field label="Last name" placeholder="Martin" />
                </div>
              )}
              <Field label="Email" placeholder="eloise@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Field label="Password" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              {tab === 'register' && <Field label="Confirm password" placeholder="••••••••" type="password" />}
            </div>
            {tab === 'signin' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 13 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-soft)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--ink)' }} /> Remember me
                </label>
                <a href="#" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Forgot password?</a>
              </div>
            )}
            <button
              onClick={handleSubmit}
              style={{
                marginTop: 28, width: '100%', background: 'var(--ink)', color: 'var(--surface)',
                border: 0, borderRadius: 'var(--radius)', padding: '16px 22px', fontSize: 14,
                fontWeight: 500, letterSpacing: '0.02em', cursor: 'pointer', transition: 'all .2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
            >
              {tab === 'signin' ? 'Sign in' : 'Create account'}
              <SIcon name="arrow-right" size={14} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              or
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SocialBtn icon="apple" label="Apple" />
              <SocialBtn icon="chrome" label="Google" />
            </div>
            <div style={{ marginTop: 32, padding: '18px 22px', border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink)' }}>Continue as guest</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>No account needed — book in 2 clicks</div>
              </div>
              <Link to="/book" style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '9px 16px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                Book as guest <SIcon name="arrow-right" size={13} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text', value, onChange }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--surface)', border: '1px solid var(--line)',
            padding: isPassword ? '14px 44px 14px 16px' : '14px 16px',
            borderRadius: 'var(--radius)', fontSize: 14.5, color: 'var(--ink)', outline: 'none',
            fontFamily: 'var(--sans)', transition: 'all .2s ease',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px var(--champagne-soft)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
          >
            <SIcon name={show ? 'eye-off' : 'eye'} size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function SocialBtn({ icon, label }) {
  return (
    <button style={{
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)',
      padding: '13px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s ease'
    }}>
      <SIcon name={icon} size={16} />
      {label}
    </button>
  )
}
