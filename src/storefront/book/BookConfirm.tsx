import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { ApiError } from '@/shared/api/client';
import { useBookStore, fmtDuration, addMinutes, ANY_STYLIST, type BookService } from './bookStore';
import { useBookingStore } from '@/features/schedule/bookingStore';
import { useMoneyFormatter } from '@/utils/money';
import { useAuthStore } from '@/shared/store/authStore';

/** Étape 4 — récap + coordonnées + confirmation (POST /appointments online). */
export function BookConfirm() {
  const formatMoney = useMoneyFormatter();
  const salonSlug = useBookStore((s) => s.salonSlug);
  const catalog = useBookStore((s) => s.catalog);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const date = useBookStore((s) => s.date);
  const slotStart = useBookStore((s) => s.slotStart);
  const slotTime = useBookStore((s) => s.slotTime);
  const stylistId = useBookStore((s) => s.stylistId);
  const stylistName = useBookStore((s) => s.stylistName);
  const form = useBookStore((s) => s.form);
  const setForm = useBookStore((s) => s.setForm);
  const back = useBookStore((s) => s.back);
  const setStep = useBookStore((s) => s.setStep);
  const setDone = useBookStore((s) => s.setDone);
  const error = useBookStore((s) => s.error);
  const setError = useBookStore((s) => s.setError);

  const bookPublic = useBookingStore((s) => s.bookPublic);
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user || form.firstName || form.email) return;
    const parts = (user.name ?? '').trim().split(' ');
    setForm({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      email: user.email ?? '',
      phone: user.phone ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const services = useMemo<BookService[]>(
    () => selected.map((id) => catalog.find((c) => c._id === id)).filter(Boolean) as BookService[],
    [selected, catalog],
  );
  const totalDur = services.reduce((a, s) => a + s.durationMin, 0);
  const totalPrice = services.reduce((a, s) => a + s.price, 0);
  const hold = Math.round(totalPrice * 0.2);
  const valid = form.firstName.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.terms && stylistId !== ANY_STYLIST;

  const submit = async () => {
    if (!valid || !salonSlug) return;
    setSubmitting(true);
    setError(null);
    try {
      const appt = await bookPublic(salonSlug, {
        serviceIds: selected,
        stylistId,
        start: slotStart,
        source: 'online',
        clientName: `${form.firstName} ${form.lastName}`.trim(),
        clientPhone: form.phone,
        clientEmail: form.email,
      });
      setDone({
        id: appt._id,
        reference: `HR-${appt._id.slice(-6).toUpperCase()}`,
        email: form.email,
        stylistName,
        dateLabel: date,
        time: slotTime,
      });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError('Ce créneau vient d’être réservé. Choisissez-en un autre.');
        setStep(4);
      } else {
        setError(err instanceof ApiError ? err.message : 'Réservation impossible.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="book-eyebrow">Step Four · Confirm your booking</div>
      <h1 className="book-h1">Almost <em>there</em>.</h1>
      <p className="book-lead">A quick look at everything, and a few details so we can welcome you properly. No payment now — we'll authorise a small hold and settle in the salon.</p>

      <div className="confirm-summary" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <h3>{date}{slotTime && <>, <em>{slotTime}</em></>}</h3>
            <div className="meta" style={{ marginTop: 6 }}>
              with <strong>{stylistName || '—'}</strong> · {fmtDuration(totalDur)} continuous · ends approx. {slotTime ? addMinutes(slotTime, totalDur) : '—'}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(243,236,224,.15)', paddingTop: 14, marginTop: 6 }}>
          {services.map((s, i) => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'rgba(243,236,224,.85)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--surface)' }}>
                <span style={{ fontStyle: 'italic', color: 'var(--champagne)', marginRight: 8 }}>{i + 1}.</span>{s.name}
              </span>
              <span style={{ color: 'rgba(243,236,224,.6)' }}>{fmtDuration(s.durationMin)} · {formatMoney(s.price)}</span>
            </div>
          ))}
        </div>
        <div className="total"><span className="l">Total</span><span className="r"><em>{formatMoney(totalPrice)}</em></span></div>
      </div>

      <div className="confirm-grid">
        <div className="confirm-block">
          <h4>Your details</h4>
          <div className="input-row">
            <div className="field"><label>First name</label><input value={form.firstName} onChange={(e) => setForm({ firstName: e.target.value })} placeholder="Aïcha" /></div>
            <div className="field"><label>Last name</label><input value={form.lastName} onChange={(e) => setForm({ lastName: e.target.value })} placeholder="Benhima" /></div>
          </div>
          <div className="input-row full"><div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ email: e.target.value })} placeholder="aicha@example.com" /></div></div>
          <div className="input-row full"><div className="field"><label>Mobile</label><input type="tel" value={form.phone} onChange={(e) => setForm({ phone: e.target.value })} placeholder="+33 6 12 34 56 78" /></div></div>
        </div>

        <div className="confirm-block">
          <h4>Personalise your visit</h4>
          <div className="input-row full"><div className="field"><label>Anything to mention?</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ notes: e.target.value })} placeholder="Allergies, preferences, a reference image…" style={{ resize: 'vertical' }} />
          </div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isFirstTime} onChange={(e) => setForm({ isFirstTime: e.target.checked })} style={{ accentColor: 'var(--ink)' }} />
              This is my first visit to Haire
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.smsReminder} onChange={(e) => setForm({ smsReminder: e.target.checked })} style={{ accentColor: 'var(--ink)' }} />
              Send me an SMS reminder 24 hours before
            </label>
          </div>
        </div>

        <div className="confirm-block span">
          <h4>Salon Policies</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.5 }}>
            <div><div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', marginBottom: 6, fontStyle: 'italic' }}>Cancellations</div>Free up to 24h before. After, a 50% fee may apply.</div>
            <div><div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', marginBottom: 6, fontStyle: 'italic' }}>Lateness</div>We hold your chair 10 minutes — the rest may need to shorten.</div>
            <div><div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', marginBottom: 6, fontStyle: 'italic' }}>The hold</div>We authorise 20% on your card. You pay in full in salon.</div>
          </div>
          <div className="terms">
            <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ terms: e.target.checked })} style={{ accentColor: 'var(--ink)' }} />
            <span>I agree to Salon Haire's <a href="#" style={{ color: 'var(--ink)' }}>terms of service</a> and <a href="#" style={{ color: 'var(--ink)' }}>cancellation policy</a>, and consent to a card hold of <strong>{formatMoney(hold)}</strong>.</span>
          </div>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</p>}

      <div className="book-actions">
        <button className="btn" onClick={back}><ArrowLeft size={14} />Back</button>
        <button className="btn btn-primary" disabled={!valid || submitting} onClick={submit}>
          <Check size={14} />Confirm booking · {formatMoney(totalPrice)}
        </button>
      </div>
    </div>
  );
}
