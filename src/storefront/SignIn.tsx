import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Apple, Eye, EyeOff, Info, LayoutGrid } from 'lucide-react';
import './signin/signin.css';
import { useAuthStore } from '@/shared/store/authStore';
import { isBackoffice, type Role } from '@/shared/auth/types';
import { ApiError } from '@/shared/api/client';

type Tab = 'signin' | 'register' | 'owner';

function homeFor(role: Role): string {
  if (role === 'owner' || role === 'manager') return '/overview';
  if (role === 'stylist') return '/schedule';
  return '/my-account';
}

/** Sign in / Create account / Owner access — design Maison Haire (split-panel). */
export function SignIn() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<Tab>('signin');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', remember: true, terms: false });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const go = (role: Role) => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? (isBackoffice(role) ? homeFor(role) : '/my-account'), { replace: true });
  };

  const doSignIn = async () => {
    setBusy(true); setError(null);
    try {
      const user = await login({ identifier: form.email, password: form.password });
      go(user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible.');
    } finally { setBusy(false); }
  };

  const doRegister = async () => {
    if (!form.terms) { setError('Veuillez accepter les conditions.'); return; }
    setBusy(true); setError(null);
    try {
      const user = await register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        identifier: form.email, phone: form.phone, password: form.password,
      });
      go(user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible.');
    } finally { setBusy(false); }
  };

  return (
    <div className="signin-page">
      <aside className="signin-art">
        <div className="ph ph-3" />
        <div className="top-row">
          <Link to="/"><ArrowLeft size={14} />Back to maison</Link>
          <Link to="/book">Book without account<ArrowRight size={14} /></Link>
        </div>
        <div>
          <div className="brand-big">Haire<span className="dot">.</span></div>
          <div className="tagline" style={{ marginTop: 24 }}>
            Welcome <em>back</em>.<br />Or in, for the <em>first time</em>.
          </div>
        </div>
        <div className="bottom-row">MAISON DU CHEVEU · LE MARAIS · 18 RUE DE SÉVIGNÉ</div>
      </aside>

      <div className="signin-form">
        <div className="signin-tabs">
          <button className={tab === 'signin' ? 'on' : ''} onClick={() => { setTab('signin'); setError(null); }}>Sign in</button>
          <button className={tab === 'register' ? 'on' : ''} onClick={() => { setTab('register'); setError(null); }}>Create account</button>
          <button className={`owner${tab === 'owner' ? ' on' : ''}`} onClick={() => { setTab('owner'); setError(null); }}>Owner access</button>
        </div>

        {tab === 'signin' && (
          <>
            <h1>Welcome <em>back</em>.</h1>
            <p className="lead">Sign in to view your bookings, your saved formula, and your stored payment methods.</p>
            <div className="fields">
              <div className="fancy-field">
                <label>Email or phone</label>
                <input type="text" placeholder="you@maison.paris or +33 6 12 34 56" value={form.email} onChange={(e) => set('email', e.target.value)} autoFocus autoComplete="username" />
              </div>
              <div className="fancy-field">
                <label>Password</label>
                <div className="pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" className="eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Hide' : 'Show'}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            </div>
            <div className="signin-row-foot">
              <label><input type="checkbox" checked={form.remember} onChange={(e) => set('remember', e.target.checked)} />Keep me signed in</label>
              <Link to="/reset-password">Forgot password?</Link>
            </div>
            {error && <p className="signin-error">{error}</p>}
            <button className="signin-cta" onClick={doSignIn} disabled={busy}>Sign in<ArrowRight size={14} /></button>
          </>
        )}

        {tab === 'register' && (
          <>
            <h1>Become a <em>member</em>.</h1>
            <p className="lead">Open an account in 30 seconds — earn 8% back on every visit, and never lose your formula again.</p>
            <div className="fields">
              <div className="field-row">
                <div className="fancy-field"><label>First name</label><input placeholder="Aïcha" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} autoFocus /></div>
                <div className="fancy-field"><label>Last name</label><input placeholder="Benhima" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div>
              </div>
              <div className="fancy-field"><label>Email</label><input type="email" placeholder="aicha@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="fancy-field"><label>Mobile</label><input type="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <div className="fancy-field">
                <label>Create password</label>
                <div className="pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" className="eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Hide' : 'Show'}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            </div>
            <div className="signin-row-foot" style={{ justifyContent: 'flex-start', gap: 10, lineHeight: 1.4, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ color: 'var(--ink-soft)', fontSize: 12.5 }}>I agree to Maison Haire's <a href="#">terms of service</a> and would like to receive the seasonal newsletter — opt out anytime.</span>
            </div>
            {error && <p className="signin-error">{error}</p>}
            <button className="signin-cta" onClick={doRegister} disabled={busy}>Create my account<ArrowRight size={14} /></button>
          </>
        )}

        {tab === 'owner' && (
          <>
            <div className="owner-eyebrow"><span className="ico"><LayoutGrid size={15} /></span>Salon management portal</div>
            <h1>Owner <em>access</em>.</h1>
            <p className="lead">Sign in to manage appointments, stylists, revenue analytics, and all salon operations.</p>
            <div className="fields">
              <div className="fancy-field"><label>Owner email or phone</label><input type="text" placeholder="owner@salon.com or +33 6 xx xx xx" value={form.email} onChange={(e) => set('email', e.target.value)} autoFocus autoComplete="username" /></div>
              <div className="fancy-field">
                <label>Password</label>
                <div className="pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" className="eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Hide' : 'Show'}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            </div>
            <div className="signin-row-foot" style={{ justifyContent: 'flex-end' }}>
              <Link to="/reset-password">Forgot password?</Link>
            </div>
            {error && <p className="signin-error">{error}</p>}
            <button className="signin-cta gold" onClick={doSignIn} disabled={busy}><LayoutGrid size={15} />Enter dashboard</button>
            <div className="owner-note"><Info size={14} style={{ marginTop: 2, flexShrink: 0 }} /><span>Owner accounts are created by Maison Haire. Contact <strong>support@haire.fr</strong> to request access.</span></div>
          </>
        )}

        {tab !== 'owner' && (
          <>
            <div className="signin-divider">Or continue with</div>
            <div className="social-row">
              <button className="social-btn" type="button"><Apple size={16} />Apple</button>
              <button className="social-btn" type="button"><span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 16 }}>G</span>Google</button>
            </div>
            <div className="guest-row">
              <div className="lhs">
                <div className="t">In a hurry?</div>
                <div className="s">Reserve without an account in under a minute.</div>
              </div>
              <Link to="/book">Continue as guest<ArrowRight size={13} /></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
