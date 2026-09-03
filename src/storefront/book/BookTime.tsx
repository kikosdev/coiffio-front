import { useEffect, useMemo } from 'react';
import { Sunrise, Sun, MoonStar } from 'lucide-react';
import { useBookStore, fmtDuration, addMinutes, dateChips, ANY_STYLIST } from './bookStore';
import { useBookingStore, type SlotOption } from '@/features/schedule/bookingStore';

const RAIL_START = 9;
const RAIL_END = 20;
const pct = (h: number) => ((h - RAIL_START) / (RAIL_END - RAIL_START)) * 100;
const hourOf = (t: string) => Number(t.split(':')[0]) + Number(t.split(':')[1]) / 60;

/** Étape 3 — créneau continu réel via /availability (#1). */
export function BookTime() {
  const salonSlug = useBookStore((s) => s.salonSlug);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const catalog = useBookStore((s) => s.catalog);
  const date = useBookStore((s) => s.date);
  const setDate = useBookStore((s) => s.setDate);
  const stylistId = useBookStore((s) => s.stylistId);
  const slotTime = useBookStore((s) => s.slotTime);
  const setSlot = useBookStore((s) => s.setSlot);
  const lockStylist = useBookStore((s) => s.lockStylist);

  const availability = useBookingStore((s) => s.availability);
  const loading = useBookingStore((s) => s.availabilityLoading);
  const fetchPublicAvailability = useBookingStore((s) => s.fetchPublicAvailability);

  const totalDur = selected.reduce((a, id) => a + (catalog.find((c) => c._id === id)?.durationMin ?? 0), 0);
  const chips = useMemo(() => dateChips(), []);
  const isAny = stylistId === ANY_STYLIST;

  useEffect(() => {
    if (!salonSlug || selected.length === 0) return;
    if (isAny) void fetchPublicAvailability(salonSlug, selected, date);
    else void fetchPublicAvailability(salonSlug, selected, date, stylistId);
  }, [salonSlug, selected, date, stylistId, isAny, fetchPublicAvailability]);

  // Résout le styliste affiché (le meilleur si "any").
  const resolved = useMemo(() => {
    if (isAny) return availability.slice().sort((a, b) => b.slots.length - a.slots.length)[0] ?? null;
    return availability.find((a) => a.stylistId === stylistId) ?? null;
  }, [availability, isAny, stylistId]);

  const slots: SlotOption[] = resolved?.slots ?? [];
  const morning = slots.filter((s) => hourOf(s.time) < 12);
  const afternoon = slots.filter((s) => hourOf(s.time) >= 12 && hourOf(s.time) < 17);
  const evening = slots.filter((s) => hourOf(s.time) >= 17);

  const pick = (slot: SlotOption) => {
    setSlot(slot.start, slot.time);
    if (isAny && resolved) lockStylist(resolved.stylistId, resolved.stylistName);
  };

  const sections = [
    { label: 'Morning', Icon: Sunrise, slots: morning },
    { label: 'Afternoon', Icon: Sun, slots: afternoon },
    { label: 'Evening', Icon: MoonStar, slots: evening },
  ];

  return (
    <div>
      <div className="book-eyebrow">Step Three · Choose your time</div>
      <h1 className="book-h1">When <em>suits</em>?</h1>
      <p className="book-lead">
        Only slots with a continuous <strong>{fmtDuration(totalDur)}</strong> opening are shown. Your visit settles into a single, uninterrupted chair time.
      </p>

      <div className="date-strip">
        {chips.map((c) => (
          <button key={c.iso} className={`date-chip${date === c.iso ? ' on' : ''}`} onClick={() => setDate(c.iso)}>
            <span className="dow">{c.dow}</span>
            <span className="num">{c.num}</span>
            <span className="mon">{c.mon}</span>
            <span className="slots">{date === c.iso ? `${slots.length} open` : (c.label ?? '·')}</span>
          </button>
        ))}
      </div>

      {resolved && (
        <div className="day-flow">
          <div className="day-flow-head">
            <div>
              <div className="book-eyebrow" style={{ marginBottom: 6 }}>Day flow</div>
              <div className="title">{isAny && <em>Best fit: </em>}{resolved.stylistName}'s <em>day</em></div>
            </div>
            <div className="meta">
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--champagne-soft)', border: '1px solid var(--champagne)', borderRadius: 2, marginRight: 5, verticalAlign: '-1px' }} />Fits your visit</span>
            </div>
          </div>
          <div className="flow-track">
            <div className="flow-rail" />
            <div className="flow-shift" style={{ left: `${pct(RAIL_START)}%`, width: '100%', background: 'var(--surface)', borderColor: 'var(--line)' }} />
            {slots.map((s) => (
              <div
                key={s.start}
                className={`flow-block${slotTime === s.time ? ' selected' : ''}`}
                style={{ left: `${pct(hourOf(s.time))}%` }}
                data-time={s.time}
                onClick={() => pick(s)}
              />
            ))}
            <div className="flow-ticks">
              {Array.from({ length: RAIL_END - RAIL_START + 1 }, (_, i) => RAIL_START + i).map((h) => (
                <span key={h} className="flow-tick" style={{ left: `${pct(h)}%`, top: 0 }}>{String(h).padStart(2, '0')}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="book-lead">Searching availability…</p>
      ) : slots.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius-lg)', color: 'var(--muted)' }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>Fully booked.</div>
          <div style={{ fontSize: 13 }}>No continuous {fmtDuration(totalDur)} window on this day — try another date above.</div>
        </div>
      ) : (
        sections.map((g) => g.slots.length > 0 && (
          <div key={g.label} className="slot-section">
            <div className="slot-section-head">
              <div className="lbl"><g.Icon size={12} style={{ marginRight: 6, verticalAlign: '-1px' }} />{g.label}</div>
              <div className="count">{g.slots.length} options</div>
            </div>
            <div className="slot-grid">
              {g.slots.map((s) => (
                <button key={s.start} className={`slot${slotTime === s.time ? ' on' : ''}`} onClick={() => pick(s)}>
                  {s.time}
                  <span className="end">ends {addMinutes(s.time, totalDur)}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
