import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, MapPin, Home, UserRound, CalendarPlus, Navigation } from 'lucide-react';
import './book.css';
import { useBookStore } from './bookStore';
import { BookServices } from './BookServices';
import { BookStylists } from './BookStylists';
import { BookTime } from './BookTime';
import { BookConfirm } from './BookConfirm';
import { BookSummary } from './BookSummary';
import { useAuthStore } from '@/shared/store/authStore';

const STEPS = [
  { num: 'I', label: 'Services' },
  { num: 'II', label: 'Stylist' },
  { num: 'III', label: 'Time' },
  { num: 'IV', label: 'Confirm' },
];

function BookNav() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? null;
  return (
    <nav className="book-nav">
      <div className="brand">
        <span className="mark">Haire</span>
        <span className="dot" />
        <span className="sub">Maison du Cheveu</span>
      </div>
      <div className="right">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> 18 rue de Sévigné, Paris 4</span>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><Home size={13} /> Home</Link>
        <span style={{ color: 'var(--line-strong)' }}>·</span>
        {user ? (
          <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <UserRound size={13} /> {firstName}
          </Link>
        ) : (
          <Link to="/sign-in" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <UserRound size={13} /> Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

function StepRail({ canGoTo }: { canGoTo: (n: number) => boolean }) {
  const step = useBookStore((s) => s.step);
  const setStep = useBookStore((s) => s.setStep);
  return (
    <div className="step-rail">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const status = n < step ? 'done' : n === step ? 'active' : '';
        return (
          <Fragment key={s.num}>
            <button
              className={`step ${status}`}
              onClick={() => canGoTo(n) && setStep(n as 1 | 2 | 3 | 4)}
              style={{ background: 'transparent', border: 0, cursor: canGoTo(n) ? 'pointer' : 'default' }}
            >
              <span className="step-num">{n < step ? <Check size={12} /> : s.num}</span>
              <span className="step-label">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`step-bar${n < step ? ' done' : ''}`} />}
          </Fragment>
        );
      })}
    </div>
  );
}

function SuccessScreen() {
  const result = useBookStore((s) => s.result);
  const reset = useBookStore((s) => s.reset);
  if (!result) return null;
  return (
    <div className="success-card">
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--champagne-soft)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--champagne)' }}>
        <Check size={32} style={{ color: 'var(--champagne-deep)' }} />
      </div>
      <h2>Confirmed, <em>with pleasure</em>.</h2>
      <p>
        Your booking with <strong style={{ color: 'var(--ink)' }}>{result.stylistName}</strong> on <strong style={{ color: 'var(--ink)' }}>{result.dateLabel} at {result.time}</strong> is reserved.
        We've sent a confirmation to <strong style={{ color: 'var(--ink)' }}>{result.email}</strong>, and we'll text you the morning of.
      </p>
      <div className="success-ref"><span className="lbl">Reference</span><span className="val">{result.reference}</span></div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn"><CalendarPlus size={14} />Add to calendar</button>
        <button className="btn"><Navigation size={14} />Directions</button>
        <button className="btn btn-gold" onClick={reset}>Book another visit</button>
      </div>
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)', maxWidth: 480, margin: '40px auto 0' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-soft)', marginBottom: 8 }}>A small gift, on us.</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Use code <strong style={{ color: 'var(--champagne-deep)', fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.1em' }}>HAIRE-WELCOME</strong> for 15% off any retail in the boutique on the day of your visit.
        </div>
      </div>
    </div>
  );
}

/** Parcours public "Book a Visit" — 4 étapes + récap collant (design Claude). */
export function BookApp() {
  const step = useBookStore((s) => s.step);
  const done = useBookStore((s) => s.done);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const stylistId = useBookStore((s) => s.stylistId);
  const slotStart = useBookStore((s) => s.slotStart);
  const next = useBookStore((s) => s.next);
  const back = useBookStore((s) => s.back);

  const canGoTo = (n: number) => {
    if (n === 1) return true;
    if (n === 2) return selected.length > 0;
    if (n === 3) return selected.length > 0 && !!stylistId;
    if (n === 4) return selected.length > 0 && !!stylistId && !!slotStart;
    return false;
  };
  const canNext = (step === 1 && selected.length > 0) || (step === 2 && !!stylistId) || (step === 3 && !!slotStart);

  if (done) {
    return (
      <div className="book-body">
        <BookNav />
        <div className="book-stage" style={{ gridTemplateColumns: '1fr', maxWidth: 900 }}>
          <SuccessScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="book-body">
      <BookNav />
      <StepRail canGoTo={canGoTo} />
      <div className="book-stage">
        <div className="book-main">
          <div key={step} className="fade-up">
            {step === 1 && <BookServices />}
            {step === 2 && <BookStylists />}
            {step === 3 && <BookTime />}
            {step === 4 && <BookConfirm />}
          </div>

          {step < 4 && (
            <div className="book-actions">
              {step > 1 ? (
                <button className="btn" onClick={back}><ArrowLeft size={14} />Back</button>
              ) : <span />}
              <button className="btn btn-primary" disabled={!canNext} onClick={() => next()}>
                {step === 1 && 'Choose stylist'}
                {step === 2 && 'Pick a time'}
                {step === 3 && 'Review & confirm'}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
        <aside className="book-side">
          <BookSummary canNext={canNext} />
        </aside>
      </div>
    </div>
  );
}
