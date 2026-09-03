import { useEffect, useMemo, useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { useBookStore, fmtDuration, dateChips, ANY_STYLIST } from './bookStore';
import { useBookingStore, type TimelineDay } from '@/features/schedule/bookingStore';
import { fetchPublicTeam, STYLIST_TONES, type PublicStylistProfile } from './BookData';
import { localDateISO } from '@/shared/date';

const TIMELINE_DAYS = 14;

function todayISO(): string {
  return localDateISO();
}

interface NextSlot {
  date: string;
  time: string;
}

function pivotTimeline(timeline: TimelineDay[]): { qualified: Set<string>; nextByStylist: Map<string, NextSlot> } {
  const qualified = new Set<string>();
  const nextByStylist = new Map<string, NextSlot>();
  for (const day of timeline) {
    for (const st of day.stylists) {
      qualified.add(st.stylistId);
      if (st.slots.length > 0 && !nextByStylist.has(st.stylistId)) {
        nextByStylist.set(st.stylistId, { date: day.date, time: st.slots[0].time });
      }
    }
  }
  return { qualified, nextByStylist };
}

/** Étape 2 — une carte par coiffeur qualifié (portrait, bio, prochaine dispo sur 14 jours). */
export function BookStylists() {
  const salonSlug = useBookStore((s) => s.salonSlug);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const catalog = useBookStore((s) => s.catalog);
  const stylistId = useBookStore((s) => s.stylistId);
  const setStylist = useBookStore((s) => s.setStylist);

  const timeline = useBookingStore((s) => s.timeline);
  const loading = useBookingStore((s) => s.timelineLoading);
  const fetchPublicTimeline = useBookingStore((s) => s.fetchPublicTimeline);

  const [team, setTeam] = useState<PublicStylistProfile[]>([]);

  const totalDur = selected.reduce((a, id) => a + (catalog.find((c) => c._id === id)?.durationMin ?? 0), 0);

  useEffect(() => {
    if (!salonSlug) return;
    fetchPublicTeam(salonSlug).then(setTeam).catch(() => setTeam([]));
  }, [salonSlug]);

  useEffect(() => {
    if (salonSlug && selected.length > 0) void fetchPublicTimeline(salonSlug, selected, todayISO(), undefined, TIMELINE_DAYS);
  }, [salonSlug, selected, fetchPublicTimeline]);

  const { qualified, nextByStylist } = useMemo(() => pivotTimeline(timeline), [timeline]);
  const chipByIso = useMemo(() => new Map(dateChips().map((c) => [c.iso, c])), []);
  const dayLabel = (iso: string) => {
    const c = chipByIso.get(iso);
    return c ? c.label ?? `${c.dow} ${c.num}` : iso;
  };

  const stylists = team.filter((s) => s.role === 'stylist' || s.role === 'colorist');

  let anyEarliest: (NextSlot & { stylistId: string }) | null = null;
  for (const [sid, slot] of nextByStylist) {
    if (!qualified.has(sid)) continue;
    if (!anyEarliest || slot.date < anyEarliest.date || (slot.date === anyEarliest.date && slot.time < anyEarliest.time)) {
      anyEarliest = { ...slot, stylistId: sid };
    }
  }

  const select = (id: string, name: string) => setStylist(id, name);

  return (
    <div>
      <div className="book-eyebrow">Step Two · Choose your stylist</div>
      <h1 className="book-h1">
        In whose <em>hands</em>?
      </h1>
      <p className="book-lead">
        {qualified.size === 0 ? (
          loading ? (
            'Searching availability…'
          ) : (
            'No single stylist is cross-trained to perform every service in your selection. Try removing one, or let us split the booking.'
          )
        ) : (
          <>
            Each of the {qualified.size} stylist{qualified.size === 1 ? '' : 's'} below can perform{' '}
            <strong>
              all {selected.length} of your selected service{selected.length === 1 ? '' : 's'}
            </strong>{' '}
            in a continuous {fmtDuration(totalDur)} block.
          </>
        )}
      </p>

      <div className="stylist-list">
        {anyEarliest && (
          <div
            className={`stylist-card stylist-any-card${stylistId === ANY_STYLIST ? ' selected' : ''}`}
            onClick={() => select(ANY_STYLIST, 'Any preference')}
          >
            <div className="stylist-portrait">
              <div className="ph ph-5" />
              <div className="stylist-portrait-init" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={30} />
              </div>
            </div>
            <div className="stylist-info">
              <div className="stylist-name">
                No <em>preference</em>
              </div>
              <div className="stylist-role">Earliest availability</div>
              <div className="stylist-bio">
                We'll pair you with the soonest-available qualified stylist — perfect if time matters more than the chair.
              </div>
            </div>
            <div className="stylist-right">
              <div className="stylist-next">
                <div className="label">First open</div>
                <div className="val">
                  {dayLabel(anyEarliest.date)} · <em>{anyEarliest.time}</em>
                </div>
              </div>
              <div className="stylist-radio" />
            </div>
          </div>
        )}

        {stylists.map((s, i) => {
          const isQual = qualified.has(s.id);
          const next = nextByStylist.get(s.id);
          return (
            <div
              key={s.id}
              className={`stylist-card${!isQual ? ' disabled' : ''}${stylistId === s.id ? ' selected' : ''}`}
              onClick={() => isQual && select(s.id, s.name)}
            >
              <div className="stylist-portrait">
                <div className={`ph ${STYLIST_TONES[i % STYLIST_TONES.length]}`} />
                <div className="stylist-portrait-init">{s.name[0]}</div>
              </div>
              <div className="stylist-info">
                <div className="stylist-name">{s.name}</div>
                <div className="stylist-role">{s.title || s.role}</div>
                {s.bio && <div className="stylist-bio">{s.bio}</div>}
              </div>
              <div className="stylist-right">
                {isQual ? (
                  <>
                    <div className="stylist-next">
                      <div className="label">Next open</div>
                      <div className="val">
                        {next ? (
                          <>
                            {dayLabel(next.date)} · <em>{next.time}</em>
                          </>
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>
                    <div className="stylist-radio" />
                  </>
                ) : (
                  <div className="stylist-no-match">
                    <Info size={11} style={{ marginRight: 5, verticalAlign: '-1px' }} />
                    Can't cover this combination
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
