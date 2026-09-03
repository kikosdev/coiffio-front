import { useMemo } from 'react';
import { ArrowRight, Calendar, Check, Clock, UserRound, X } from 'lucide-react';
import { useBookStore, fmtDuration, ANY_STYLIST, type BookService } from './bookStore';
import { useMoneyFormatter } from '@/utils/money';

const SEG = ['s-0', 's-1', 's-2', 's-3', 's-4'];

interface Props { canNext: boolean; }

/** Récap collant du booking (panier services, totaux, CTA). */
export function BookSummary({ canNext }: Props) {
  const formatMoney = useMoneyFormatter();
  const catalog = useBookStore((s) => s.catalog);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const stylistId = useBookStore((s) => s.stylistId);
  const stylistName = useBookStore((s) => s.stylistName);
  const slotTime = useBookStore((s) => s.slotTime);
  const date = useBookStore((s) => s.date);
  const step = useBookStore((s) => s.step);
  const next = useBookStore((s) => s.next);
  const removeService = useBookStore((s) => s.removeService);

  const services = useMemo<BookService[]>(
    () => selected.map((id) => catalog.find((c) => c._id === id)).filter(Boolean) as BookService[],
    [selected, catalog],
  );
  const totalDur = services.reduce((a, s) => a + s.durationMin, 0);
  const totalPrice = services.reduce((a, s) => a + s.price, 0);
  const stylistLabel = stylistId === ANY_STYLIST ? 'No preference' : stylistName;
  const hold = Math.round(totalPrice * 0.2);

  const ctaLabel =
    step === 1 ? 'Choose services' : step === 2 ? 'Choose stylist' : step === 3 ? 'Pick a time' : step === 4 ? 'Review & confirm' : 'Confirm booking';

  return (
    <div className="summary">
      <div className="summary-head">
        <h3>Your <em>booking</em></h3>
        <div className="sub">{services.length === 0 ? 'No services yet' : `${services.length} service${services.length === 1 ? '' : 's'} · ${fmtDuration(totalDur)}`}</div>
      </div>

      {services.length === 0 ? (
        <div className="summary-empty">Choose any service from the menu — your basket appears here.</div>
      ) : (
        <>
          <div className="summary-items">
            {services.map((s) => (
              <div key={s._id} className="summary-row">
                <div>
                  <div className="sr-name">{s.name}</div>
                  <div className="sr-dur">{fmtDuration(s.durationMin)}</div>
                </div>
                <div className="sr-price">{formatMoney(s.price)}</div>
                <button className="sr-rm" onClick={() => removeService(s._id)} title="Remove"><X size={13} /></button>
              </div>
            ))}
          </div>

          {services.length > 1 && (
            <div style={{ padding: '0 24px 4px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, fontWeight: 500 }}>Total time</div>
              <div className="duration-bar">
                {services.map((s, i) => (
                  <div key={s._id} className={`duration-seg ${SEG[i % SEG.length]}`} style={{ flex: s.durationMin }} title={`${s.name} · ${fmtDuration(s.durationMin)}`}>
                    {s.durationMin >= 30 && fmtDuration(s.durationMin)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="summary-totals">
            {stylistId && (
              <div className="summary-line">
                <span className="l"><UserRound size={13} /> Stylist</span>
                <strong>{stylistLabel}</strong>
              </div>
            )}
            {slotTime && (
              <div className="summary-line">
                <span className="l"><Calendar size={13} /> When</span>
                <strong>{date} · {slotTime}</strong>
              </div>
            )}
            <div className="summary-line">
              <span className="l"><Clock size={13} /> Duration</span>
              <strong>{fmtDuration(totalDur)}</strong>
            </div>
            <div className="summary-line big">
              <span className="l">Total</span>
              <span className="r"><em>{formatMoney(totalPrice)}</em></span>
            </div>
          </div>

          <div className="summary-cta">
            <button className="btn btn-primary" onClick={() => step < 5 && next()} disabled={!canNext || step === 5}>
              {step === 5 ? <Check size={14} /> : null}
              {ctaLabel}
              {step < 5 && <ArrowRight size={14} style={{ marginLeft: 6 }} />}
            </button>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textAlign: 'center', marginTop: 10, letterSpacing: '0.06em' }}>
              No payment now — {formatMoney(hold)} hold authorised on confirmation.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
