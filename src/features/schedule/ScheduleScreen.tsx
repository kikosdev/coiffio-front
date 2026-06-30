import { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Filter, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@/shared/ui';
import { localDateISO } from '@/shared/date';
import { useAppointmentDetailStore } from '@/shared/store/appointmentDetailStore';
import { useBookingStore, type Appointment } from './bookingStore';
import { useTeamStore } from '@/features/team/teamStore';
import { useServiceStore } from '@/features/services/serviceStore';
import { useClientStore } from '@/features/clients/clientStore';
import { NewAppointmentModal } from './NewAppointmentModal';
import { WalkinButton } from './WalkinButton';
import { salonNowDecHr } from '@/utils/time';
import { useMoneyFormatter } from '@/utils/money';
import { INTL_LOCALE, toAppLocale } from '@/config/locale.config';
import './schedule.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_START = 9;
const DAY_END = 20;
const TOTAL_HOURS = DAY_END - DAY_START; // 11
const HOUR_PX = 84;
const HEADER_H = 102;
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START + i);

const NON_SERVICE_ROLES = new Set(['owner', 'manager', 'client']);

const PORTRAIT_GRADIENTS = [
  'linear-gradient(170deg, #d8c4a4, #a0805e 50%, #2e2418)',
  'linear-gradient(135deg, #3a2e22, #1a1410)',
  'linear-gradient(160deg, #c9b89a, #8a7556 60%, #4a3d2e)',
  'linear-gradient(150deg, #b8a07e, #7d654a 60%, #2a2118)',
  'linear-gradient(140deg, #e0d2b8, #b89968 60%, #5c4a35)',
  'linear-gradient(165deg, #a08568, #5c4a35)',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return localDateISO();
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Les timestamps RDV stockent l'heure murale du salon comme des chiffres UTC littéraux
// (ex. "14:00" RDV → "...T14:00:00.000Z") — lecture volontairement via getUTC*, ne pas
// convertir avec un vrai fuseau ici sous peine de décaler ces heures déjà correctes.
function isoToDecHr(iso: string): number {
  const d = new Date(iso);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
}

function fmtDecHr(hr: number): string {
  const h = Math.floor(hr);
  const m = Math.round((hr - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string, locale: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(d).toUpperCase();
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }).format(d);
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(d);
  return `${weekday} · ${day} ${month}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── DayArc ──────────────────────────────────────────────────────────────────

function DayArc({ appointments }: { appointments: Appointment[] }) {
  const { t } = useTranslation('dashboard');
  const formatMoney = useMoneyFormatter();
  const W = 1100, H = 90, PAD_L = 60, PAD_R = 30;
  const innerW = W - PAD_L - PAD_R;

  // 30-min buckets 9:00–20:00
  const buckets = useMemo(() => {
    const bs: number[] = [];
    for (let t = DAY_START; t < DAY_END; t += 0.5) bs.push(t);
    return bs;
  }, []);

  const density = useMemo(() =>
    buckets.map((t) =>
      appointments.filter((a) => {
        if (a.status === 'cancelled') return false;
        const s = isoToDecHr(a.start);
        const e = isoToDecHr(a.end);
        return t >= s && t < e;
      }).length
    ),
  [buckets, appointments]);

  const maxD = Math.max(...density, 1);

  const pts: [number, number][] = buckets.map((_, i) => {
    const x = PAD_L + (i / (buckets.length - 1)) * innerW;
    const y = H - 14 - (density[i] / maxD) * (H - 28);
    return [x, y];
  });

  const linePath = pts.reduce((p, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return p + ` Q ${cx} ${py} ${cx} ${(py + y) / 2} T ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${PAD_L + innerW} ${H - 14} L ${PAD_L} ${H - 14} Z`;

  const now = useMemo(() => salonNowDecHr(), []);
  const nowVisible = now >= DAY_START && now <= DAY_END;
  const nowX = PAD_L + ((now - DAY_START) / TOTAL_HOURS) * innerW;

  const active = appointments.filter((a) => a.status !== 'cancelled');
  const confirmed = active.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
  const pending = active.filter((a) => a.status === 'booked').length;
  const total = active.length;
  const revenue = active.reduce((s, a) => s + (a.price ?? 0), 0);
  const bookedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="sch-arc-card">
      <div className="sch-arc-top">
        <div>
          <div className="sch-eyebrow">{t('schedule.arcOfDay')}</div>
          <div className="sch-arc-count">
            <em>{total}</em> {t('schedule.appointments', { count: total })}
            <span className="sch-arc-count-sub">
              · {confirmed} {t('schedule.confirmedCount')} · {pending} {t('schedule.pendingCount')}
            </span>
          </div>
        </div>
        <div className="sch-arc-stats">
          <div className="sch-arc-stat">
            <span className="sch-arc-stat-l">{t('schedule.booked')}</span>
            <span className="sch-arc-stat-v">
              {bookedPct}
              <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>%</span>
            </span>
          </div>
          <div className="sch-arc-stat">
            <span className="sch-arc-stat-l">{t('schedule.revenue')}</span>
            <span className="sch-arc-stat-v"><em>{formatMoney(revenue)}</em></span>
          </div>
          <div className="sch-arc-stat">
            <span className="sch-arc-stat-l">{t('schedule.walkIns')}</span>
            <span className="sch-arc-stat-v">
              {active.filter((a) => a.source === 'walkin').length}
            </span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 90, display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sch-arc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--champagne)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--champagne)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {HOURS.map((h, i) => {
          const x = PAD_L + (i / TOTAL_HOURS) * innerW;
          return (
            <g key={h}>
              <line x1={x} x2={x} y1={H - 14} y2={H - 10} stroke="var(--line-strong)" />
              <text x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--muted)"
                fontFamily="Inter, sans-serif" letterSpacing="0.1em">
                {h.toString().padStart(2, '0')}
              </text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L + innerW} y1={H - 14} y2={H - 14} stroke="var(--line-strong)" />

        {total > 0 && (
          <>
            <path d={areaPath} fill="url(#sch-arc-fill)" />
            <path d={linePath} fill="none" stroke="var(--champagne)" strokeWidth="1.5" />
          </>
        )}

        {nowVisible && (
          <>
            <line x1={nowX} x2={nowX} y1={6} y2={H - 14}
              stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            <circle cx={nowX} cy={H - 14} r="3.5" fill="var(--ink)" />
            <text x={nowX + 8} y={14} fontSize="10" fill="var(--ink)"
              fontFamily="Inter, sans-serif" fontWeight="500">
              {t('schedule.now')} · {fmtDecHr(now)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Appointment card ─────────────────────────────────────────────────────────

function ApptBlock({
  appt,
  serviceLabel,
  clientLabel,
  onCancel,
}: {
  appt: Appointment;
  serviceLabel: string;
  clientLabel: string;
  onCancel?: (id: string) => void;
}) {
  const { t } = useTranslation('dashboard');
  const formatMoney = useMoneyFormatter();
  const openDetails = useAppointmentDetailStore((s) => s.open);
  const start = isoToDecHr(appt.start);
  const end = isoToDecHr(appt.end);

  const clampedStart = Math.max(start, DAY_START);
  const clampedEnd = Math.min(end, DAY_END);
  const top = (clampedStart - DAY_START) * HOUR_PX;
  const height = Math.max((clampedEnd - clampedStart) * HOUR_PX - 3, 22);

  const isConf = appt.status === 'confirmed' || appt.status === 'completed';
  const isCancelled = appt.status === 'cancelled';
  const cls = `sch-appt ${isConf ? 'conf' : isCancelled ? 'canc' : 'pend'}`;

  return (
    <div className={cls} style={{ top, height, cursor: 'pointer' }} onClick={() => openDetails(appt._id)}>
      <div className="sch-appt-bar" />
      <div className="sch-appt-content">
        <div className="sch-appt-title">{serviceLabel || '—'}</div>
        <div className="sch-appt-meta">
          <span>{clientLabel}</span>
          <span className="tabnums">{fmtDecHr(start)}</span>
        </div>
        <div className="sch-appt-foot">
          <span className={`sch-chip ${isConf ? 'conf' : 'pend'}`}>
            <span className="sch-chip-dot" />
            {isConf ? t('schedule.confirmed') : t('schedule.pending')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="sch-appt-price">{formatMoney(appt.price ?? 0)}</span>
            {onCancel && !isCancelled && (
              <button
                className="sch-appt-cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(appt._id);
                }}
                aria-label={t('schedule.cancel')}
              >
                <X size={11} />
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sparkline from appointment density ──────────────────────────────────────

function sparkPath(appts: Appointment[]): string {
  const pts = HOURS.slice(0, -1).map((h, i) => {
    const count = appts.filter((a) => {
      const s = isoToDecHr(a.start);
      const e = isoToDecHr(a.end);
      return h >= s && h < e && a.status !== 'cancelled';
    }).length;
    const x = (i / (TOTAL_HOURS - 1)) * 110;
    const y = 22 - Math.min(count / 3, 1) * 18;
    return [x, y] as [number, number];
  });
  return pts.reduce((p, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    return p + ` Q ${(px + x) / 2} ${py} ${x} ${y}`;
  }, '');
}

// ─── Stylist column ───────────────────────────────────────────────────────────

function StylistColumn({
  staff,
  index,
  appointments,
  serviceLabel,
  clientName,
  now,
  onCancel,
}: {
  staff: { id: string; name: string; role: string };
  index: number;
  appointments: Appointment[];
  serviceLabel: (ids: string[]) => string;
  clientName: (id: string) => string;
  now: number;
  onCancel: (id: string) => void;
}) {
  const { t } = useTranslation('dashboard');
  const myAppts = useMemo(
    () => appointments.filter((a) => a.stylistId === staff.id && a.status !== 'cancelled'),
    [appointments, staff.id],
  );

  // Compute available gaps (between DAY_START and DAY_END)
  const gaps = useMemo(() => {
    const sorted = [...myAppts]
      .filter((a) => a.status !== 'cancelled')
      .map((a) => ({ s: Math.max(isoToDecHr(a.start), DAY_START), e: Math.min(isoToDecHr(a.end), DAY_END) }))
      .sort((a, b) => a.s - b.s);

    const out: { from: number; to: number }[] = [];
    let cursor = DAY_START;
    for (const { s, e } of sorted) {
      if (s > cursor + 0.25) out.push({ from: cursor, to: s });
      cursor = Math.max(cursor, e);
    }
    if (cursor < DAY_END - 0.25) out.push({ from: cursor, to: DAY_END });
    return out;
  }, [myAppts]);

  const gradient = PORTRAIT_GRADIENTS[index % PORTRAIT_GRADIENTS.length];
  const spark = useMemo(() => sparkPath(appointments.filter((a) => a.stylistId === staff.id)), [appointments, staff.id]);
  const totalHr = TOTAL_HOURS;

  return (
    <div className="sch-col">
      {/* Header */}
      <div className="sch-col-head">
        <div className="sch-col-head-top">
          <div className="sch-col-portrait" style={{ background: gradient }}>
            <span className="sch-col-init">{initials(staff.name)}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sch-col-name">{staff.name}</div>
            <div className="sch-col-role">
              {t(`schedule.roles.${staff.role}`, { defaultValue: staff.role })}
            </div>
          </div>
        </div>
        <div className="sch-col-bottom">
          <span className="sch-col-shift">
            {DAY_START.toString().padStart(2, '0')}:00 – {DAY_END.toString().padStart(2, '0')}:00
          </span>
          <svg className="sch-col-spark" viewBox="0 0 110 22" preserveAspectRatio="none">
            {spark && <path d={spark} fill="none" stroke="var(--champagne)" strokeWidth="1.2" />}
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="sch-col-body" style={{ height: totalHr * HOUR_PX }}>
        {/* Hour + half-hour lines */}
        {HOURS.map((_, i) => (
          <div key={i} className="sch-hour-line" style={{ top: i * HOUR_PX }} />
        ))}
        {HOURS.slice(0, -1).map((_, i) => (
          <div key={'h' + i} className="sch-half-line" style={{ top: i * HOUR_PX + HOUR_PX / 2 }} />
        ))}

        {/* Available slots */}
        {gaps.map((g, i) => {
          const dur = g.to - g.from;
          if (dur < 0.5) return null;
          return (
            <div
              key={'gap' + i}
              className="sch-avail"
              style={{
                top: (g.from - DAY_START) * HOUR_PX,
                height: dur * HOUR_PX - 3,
              }}
            >
              <span>{t('schedule.available')}</span>
              <span className="sch-avail-time">{fmtDecHr(g.from)}</span>
            </div>
          );
        })}

        {/* Now line */}
        {now >= DAY_START && now <= DAY_END && (
          <div className="sch-now" style={{ top: (now - DAY_START) * HOUR_PX }} />
        )}

        {/* Appointments */}
        {appointments
          .filter((a) => a.stylistId === staff.id)
          .map((a) => (
            <ApptBlock
              key={a._id}
              appt={a}
              serviceLabel={serviceLabel(a.services)}
              clientLabel={clientName(a.clientId)}
              onCancel={onCancel}
            />
          ))}
      </div>
    </div>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function ScheduleScreen() {
  const { t, i18n } = useTranslation('dashboard');
  const intlLocale = INTL_LOCALE[toAppLocale(i18n.language)];
  const appointments = useBookingStore((s) => s.appointments);
  const apptLoading = useBookingStore((s) => s.loading);
  const apptError = useBookingStore((s) => s.error);
  const fetchAppointments = useBookingStore((s) => s.fetchAppointments);
  const cancel = useBookingStore((s) => s.cancel);

  const staff = useTeamStore((s) => s.staff);
  const fetchStaff = useTeamStore((s) => s.fetchStaff);
  const services = useServiceStore((s) => s.items);
  const fetchServices = useServiceStore((s) => s.fetch);
  const clients = useClientStore((s) => s.items);
  const fetchClients = useClientStore((s) => s.fetch);

  const [date, setDate] = useState(todayISO);
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void fetchStaff();
    if (services.length === 0) void fetchServices();
    void fetchClients();
  }, [fetchStaff, fetchServices, fetchClients, services.length]);

  useEffect(() => {
    void fetchAppointments(date);
  }, [date, fetchAppointments]);

  const stylists = useMemo(
    () => staff.filter((s) => !NON_SERVICE_ROLES.has(s.role)),
    [staff],
  );

  const serviceLabel = (ids: string[]) =>
    ids.map((id) => services.find((s) => s._id === id)?.name ?? '—').join(' + ');

  const clientName = (id: string) => clients.find((c) => c._id === id)?.name ?? 'Client';

  const now = useMemo(() => salonNowDecHr(), []);

  const reload = () => void fetchAppointments(date);

  return (
    <div className="sch-page">
      {/* ── Page header ── */}
      <div className="sch-page-head">
        <div className="sch-lead">
          <div className="sch-eyebrow">{formatDateLabel(date, intlLocale)}</div>
          <h2 className="sch-h2">{t('schedule.headlinePrefix')} <em>{t('schedule.headlineEmphasis')}</em>.</h2>
          <p className="sch-sub">{t('schedule.subheading')}</p>
        </div>
        <div className="sch-head-actions">
          <div className="sch-seg">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
                {v === 'day' ? t('schedule.dayView') : v === 'week' ? t('schedule.weekView') : t('schedule.monthView')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDate(shiftDate(date, -1))}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--surface)', cursor: 'pointer',
            }}
          >
            <ChevronLeft size={15} color="var(--ink)" />
          </button>
          <button
            onClick={() => setDate(todayISO())}
            style={{
              padding: '6px 12px', borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--surface)', cursor: 'pointer', fontSize: 12.5,
              color: 'var(--ink)', fontFamily: 'Inter, sans-serif', fontWeight: 500,
            }}
          >
            {t('schedule.today')}
          </button>
          <button
            onClick={() => setDate(shiftDate(date, 1))}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--surface)', cursor: 'pointer',
            }}
          >
            <ChevronRight size={15} color="var(--ink)" />
          </button>
          <WalkinButton onCreated={reload} />
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, border: '1px solid var(--ink)',
              background: 'var(--ink)', cursor: 'pointer',
              fontSize: 13, color: '#faf6ee', fontFamily: 'Inter, sans-serif', fontWeight: 500,
            }}
          >
            <Plus size={14} />
            {t('schedule.newAppointment')}
          </button>
        </div>
      </div>

      {/* Error state */}
      {apptError && (
        <ErrorState message={apptError} onRetry={reload} className="mb-5" />
      )}

      {/* ── Arc of the Day ── */}
      <DayArc appointments={appointments} />

      {/* ── Legend ── */}
      <div className="sch-legend">
        <div className="sch-legend-item"><span className="lg-sw lg-conf" />{t('schedule.confirmed')}</div>
        <div className="sch-legend-item"><span className="lg-sw lg-pend" />{t('schedule.pending')}</div>
        <div className="sch-legend-item"><span className="lg-sw lg-avail" />{t('schedule.available')}</div>
        <div className="sch-legend-item"><span className="lg-sw lg-off" />{t('schedule.offShift')}</div>
        <div className="sch-legend-actions">
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Filter size={12} /> {t('schedule.filter')}
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, border: '1px solid var(--line)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Users size={12} /> {t('schedule.allStylists')}
          </button>
        </div>
      </div>

      {/* ── No staff empty state ── */}
      {stylists.length === 0 && !apptLoading && (
        <EmptyState
          label={t('schedule.emptyStaffTitle')}
          sub={t('schedule.emptyStaffSub')}
        />
      )}

      {/* ── Schedule grid ── */}
      {stylists.length > 0 && (
        <div className="sch-grid">
          {/* Time gutter */}
          <div className="sch-time-col" style={{ height: HEADER_H + TOTAL_HOURS * HOUR_PX }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="sch-time-tick"
                style={{ top: HEADER_H + i * HOUR_PX }}
              >
                <span className="sch-time-h">{h.toString().padStart(2, '0')}</span>
                <span className="sch-time-m">:00</span>
              </div>
            ))}
          </div>

          {/* Stylist columns */}
          <div className="sch-cols">
            {stylists.map((st, i) => (
              <StylistColumn
                key={st.id}
                staff={st}
                index={i}
                appointments={appointments}
                serviceLabel={serviceLabel}
                clientName={clientName}
                now={now}
                onCancel={(id) => void cancel(id)}
              />
            ))}
          </div>
        </div>
      )}

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={date}
        onBooked={reload}
      />
    </div>
  );
}
