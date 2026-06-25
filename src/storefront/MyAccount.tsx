import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock, History, Wallet, Sparkles,
  UserRound, Gem, Bell, LifeBuoy, LogOut, ArrowRight, Check,
  CalendarPlus, Download, CreditCard, Heart, Bookmark, Eye, EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/shared/store/authStore';
import { api, ApiError } from '@/shared/api/client';
import { useMoneyFormatter } from '@/utils/money';

// ─── Types ──────────────────────────────────────────────────────────────────

type Section = 'overview' | 'upcoming' | 'history' | 'payments' | 'preferences' | 'profile' | 'loyalty';

const profileSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(4, 'Téléphone requis'),
});
type ProfileForm = z.infer<typeof profileSchema>;

interface ApptService { _id: string; name: string; durationMin: number; price: number; }
interface ApptStylist { _id: string; name: string; color?: string; }
interface MyAppointment {
  _id: string;
  start: string;
  end: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
  price: number;
  services: ApptService[];
  stylistId: ApptStylist | null;
}

function fmtApptDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

const STATUS_LABEL: Record<MyAppointment['status'], string> = {
  booked: 'Réservé', confirmed: 'Confirmé', completed: 'Terminé',
  cancelled: 'Annulé', noshow: 'No-show',
};
const STATUS_COLOR: Record<MyAppointment['status'], string> = {
  booked: '#b89968', confirmed: '#3F8F6B', completed: '#3F8F6B',
  cancelled: '#B4543E', noshow: '#8A8076',
};

// ─── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'upcoming',   label: 'Upcoming',    Icon: CalendarClock },
  { id: 'history',    label: 'Visites',     Icon: History },
  { id: 'payments',   label: 'Paiements',   Icon: Wallet },
  { id: 'preferences',label: 'Préférences', Icon: Sparkles },
  { id: 'profile',    label: 'Profil',      Icon: UserRound },
  { id: 'loyalty',    label: 'Fidélité',    Icon: Gem },
];

// ─── Root component ──────────────────────────────────────────────────────────

export function MyAccount() {
  const user    = useAuthStore(s => s.user);
  const logout  = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('overview');
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const formatMoney = useMoneyFormatter();

  useEffect(() => {
    if (!user) return;
    api.get<MyAppointment[]>('/appointments/mine')
      .then(data => setAppointments(data))
      .catch(() => {})
      .finally(() => setApptLoading(false));
  }, [user]);

  const parts     = (user?.name ?? '').trim().split(' ');
  const firstName = parts[0] ?? 'Vous';
  const lastName  = parts.slice(1).join(' ');
  const initial   = firstName[0]?.toUpperCase() ?? '?';

  const onLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* ── Top nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between border-b border-line px-14 py-[18px]"
        style={{ background: 'rgba(243,236,224,.8)', backdropFilter: 'blur(20px) saturate(160%)' }}
      >
        <Link to="/" className="flex items-baseline gap-1.5 no-underline text-inherit">
          <span className="font-serif text-[28px] italic text-ink" style={{ letterSpacing: '-0.01em' }}>Coiffio</span>
          <span className="mb-[6px] inline-block h-[5px] w-[5px] rounded-full bg-champagne" />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Salon</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="border-r border-line pr-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            FR · TND
          </span>
          <span className="flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface">
            <UserRound size={14} />
            {firstName}
          </span>
          <Link
            to="/book"
            className="flex items-center gap-1.5 rounded-full bg-ink px-[22px] py-[10px] text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink no-underline"
          >
            Réserver <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Page grid ── */}
      <div className="mx-auto grid items-start gap-12 px-14 py-12" style={{ maxWidth: 1320, gridTemplateColumns: '280px 1fr' }}>

        {/* ── Sidebar ── */}
        <aside className="sticky top-24">

          {/* ID Card */}
          <div className="mb-4 overflow-hidden rounded-card border border-line bg-surface">
            {/* Banner */}
            <div className="relative h-[88px] bg-gradient-to-br from-[#c9a575] to-[#8a6d4a]">
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,.2), transparent 40%), radial-gradient(circle at 75% 70%, rgba(0,0,0,.18), transparent 50%)',
                }}
              />
            </div>
            {/* Avatar */}
            <div
              className="relative z-10 mx-auto -mt-10 flex h-[78px] w-[78px] items-center justify-center rounded-full border-[3px] border-surface font-serif text-[36px] italic text-surface"
              style={{
                background: 'linear-gradient(135deg, #ddc8a8, #a18563)',
                textShadow: '0 1px 4px rgba(0,0,0,.2)',
              }}
            >
              {initial}
            </div>
            {/* Name + tier */}
            <div className="mt-2 px-4 text-center">
              <div
                className="font-serif text-[22px] font-medium leading-[1.15]"
                style={{ letterSpacing: '-0.01em' }}
              >
                {firstName}{' '}
                <em className="font-normal italic text-champagne-deep">{lastName}</em>
              </div>
              <div className="mt-1.5 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-champagne-deep">
                <Gem size={11} />
                Initiée · membre
              </div>
            </div>
            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 border-t border-line">
              {(['0', '0 TND', '0'] as const).map((v, i) => (
                <div key={i} className={`px-1.5 py-3.5 text-center ${i < 2 ? 'border-r border-line' : ''}`}>
                  <div className="font-serif text-[22px] font-medium leading-none" style={{ letterSpacing: '-0.01em' }}>{v}</div>
                  <div className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted">
                    {['Visites', 'Dépensé', 'Points'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 rounded-card border border-line bg-surface p-2">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-md px-3.5 py-[11px] text-left text-[13.5px] transition-all ${
                  section === id
                    ? 'bg-ink text-surface'
                    : 'text-[#4a3d31] hover:bg-[#ede4d2] hover:text-ink'
                }`}
                style={{ fontWeight: 450 }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
            <div className="mx-1.5 my-2 h-px bg-line" />
            <button className="flex w-full items-center gap-3 rounded-md px-3.5 py-[11px] text-left text-[13.5px] text-[#4a3d31] transition-all hover:bg-[#ede4d2] hover:text-ink" style={{ fontWeight: 450 }}>
              <Bell size={16} /><span>Notifications</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3.5 py-[11px] text-left text-[13.5px] text-[#4a3d31] transition-all hover:bg-[#ede4d2] hover:text-ink" style={{ fontWeight: 450 }}>
              <LifeBuoy size={16} /><span>Aide &amp; support</span>
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-md px-3.5 py-[11px] text-left text-[13.5px] text-error transition-all hover:bg-[rgba(168,74,58,.08)]"
              style={{ fontWeight: 450 }}
            >
              <LogOut size={16} /><span>Se déconnecter</span>
            </button>
          </nav>
        </aside>

        {/* ── Main ── */}
        <main className="min-w-0">
          {section === 'overview'    && <OverviewSection firstName={firstName} appointments={appointments} loading={apptLoading} formatMoney={formatMoney} />}
          {section === 'upcoming'   && <UpcomingSection appointments={appointments} loading={apptLoading} formatMoney={formatMoney} />}
          {section === 'history'    && <HistorySection appointments={appointments} loading={apptLoading} formatMoney={formatMoney} />}
          {section === 'payments'   && <PaymentsSection />}
          {section === 'preferences'&& <PreferencesSection />}
          {section === 'profile'    && <ProfileSection />}
          {section === 'loyalty'    && <LoyaltySection />}
        </main>
      </div>
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, sub, cta }: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <div className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
          <span className="h-px w-[38px] bg-champagne" />
          {eyebrow}
        </div>
        <h1 className="mb-2 font-serif text-[48px] font-medium leading-none" style={{ letterSpacing: '-0.025em' }}>
          {title}
        </h1>
        <div className="text-[13.5px] text-muted">{sub}</div>
      </div>
      {cta}
    </div>
  );
}

function BookBtn({ label = 'Réserver' }: { label?: string }) {
  return (
    <Link
      to="/book"
      className="flex items-center gap-1.5 rounded-full bg-ink px-[22px] py-[10px] text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink no-underline whitespace-nowrap"
    >
      {label} <ArrowRight size={13} />
    </Link>
  );
}

function ProfileCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-card border border-line bg-surface px-7 py-[26px] mb-4 ${className}`} style={style}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-[18px] font-serif text-[22px] font-medium" style={{ letterSpacing: '-0.005em' }}>
      {children}
    </h4>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

type SectionProps = { appointments: MyAppointment[]; loading: boolean; formatMoney: (n: number) => string };

function OverviewSection({ firstName, appointments, loading, formatMoney }: { firstName: string } & SectionProps) {
  const now = new Date();
  const upcoming = appointments.filter(a => ['booked', 'confirmed'].includes(a.status) && new Date(a.start) > now);
  const past = appointments.filter(a => !upcoming.includes(a));
  const next = upcoming[0] ?? null;
  const POINTS = 0;
  const NEXT_TIER = 500;

  const lastStylist = past.find(a => a.stylistId)?.stylistId ?? null;
  const visitsWithStylist = lastStylist
    ? appointments.filter(a => a.stylistId?._id === lastStylist._id && a.status === 'completed').length
    : 0;

  return (
    <>
      <SectionHead
        eyebrow="Tableau de bord"
        title={<>Bonjour, <em className="italic font-normal text-champagne-deep">{firstName}</em>.</>}
        sub="Bienvenue dans votre espace membre Coiffio."
        cta={<BookBtn label="Réserver une visite" />}
      />

      {/* Next appointment */}
      {loading ? (
        <div className="mb-4 rounded-card border border-line bg-surface p-8 text-center text-[13px] text-muted animate-pulse">
          Chargement de vos rendez-vous…
        </div>
      ) : next ? (
        <div className="mb-4 rounded-card border border-line bg-surface p-7">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Prochain rendez-vous</div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-serif text-[22px] font-medium italic" style={{ letterSpacing: '-0.01em' }}>
                {next.services.map(s => s.name).join(' + ')}
              </div>
              <div className="mt-1 text-[13px] text-muted">
                avec <strong className="text-ink">{next.stylistId?.name ?? '—'}</strong> · {fmtApptDate(next.start)}
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ background: STATUS_COLOR[next.status] + '22', color: STATUS_COLOR[next.status] }}
            >
              {STATUS_LABEL[next.status]}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif italic text-[18px] text-champagne-deep">{formatMoney(next.price)}</span>
            <span className="text-[12px] text-muted">· No payment now — règlement en salon</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-card border border-line bg-surface p-8 text-center">
          <div className="mb-2 font-serif text-[22px] italic text-muted">Aucune visite à venir</div>
          <p className="mb-5 text-[13px] text-muted">Prenez rendez-vous pour que votre prochain passage apparaisse ici.</p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink no-underline"
          >
            <CalendarPlus size={14} /> Prendre un rendez-vous
          </Link>
        </div>
      )}

      {/* 2-col grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Stylist card */}
        <ProfileCard className="!mb-0">
          <CardTitle>Votre <em className="italic text-champagne-deep">styliste</em></CardTitle>
          <div className="flex items-center gap-3.5 rounded-[10px] border border-line bg-[#ede4d2] p-3">
            <div
              className="h-14 w-14 shrink-0 rounded-full"
              style={{ background: lastStylist?.color ? lastStylist.color : 'linear-gradient(170deg, #d8c4a4, #a0805e 50%, #2e2418)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[17px] font-medium">{lastStylist?.name ?? '— Non défini'}</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Dernier styliste</div>
              <div className="mt-1.5 flex gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1"><Heart size={11} /> {visitsWithStylist} visite{visitsWithStylist !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><Bookmark size={11} /> Formule</span>
              </div>
            </div>
            <Link
              to="/book"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-medium text-surface no-underline transition-all hover:bg-champagne hover:text-ink whitespace-nowrap"
            >
              Réserver <ArrowRight size={12} />
            </Link>
          </div>
        </ProfileCard>

        {/* Loyalty standing */}
        <ProfileCard className="!mb-0">
          <CardTitle>Fidélité <em className="italic text-champagne-deep">standing</em></CardTitle>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-serif italic text-[22px]">
              {POINTS} <span className="not-italic text-muted text-[13px]">pts</span>
            </span>
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
              {NEXT_TIER - POINTS} pour <strong className="text-champagne-deep">Maison</strong>
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-[#ede4d2] mb-2.5">
            <span
              className="absolute left-0 top-0 bottom-0 rounded-full"
              style={{
                width: `${Math.min((POINTS / NEXT_TIER) * 100, 100)}%`,
                background: 'linear-gradient(to right, #b89968, #8e7142)',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted tracking-[0.06em]">
            <span>0</span><span>Initiée</span><span>Maison</span><span>Maître</span><span>2500</span>
          </div>
          <p className="mt-3 text-[12px] text-muted leading-relaxed">
            Atteignez <strong className="text-ink">Maison</strong> pour accéder à la réservation prioritaire et aux événements exclusifs.
          </p>
        </ProfileCard>
      </div>

      {/* Recent visits */}
      <div className="overflow-hidden rounded-card border border-line bg-surface mt-6">
        <div className="flex items-center justify-between border-b border-line px-6 py-[18px]">
          <h3 className="font-serif text-[22px] font-medium">
            Dernières <em className="italic font-normal text-champagne-deep">visites</em>
          </h3>
          <span className="font-serif italic text-[14px] text-muted">
            {past.length > 0 ? `${past.length} visite${past.length > 1 ? 's' : ''}` : 'Aucune visite pour l\'instant'}
          </span>
        </div>
        {past.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-muted">
            Vos visites passées apparaîtront ici après votre première réservation.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {past.slice(0, 4).map(a => (
              <div key={a._id} className="grid items-center gap-4 px-6 py-4 text-[13px]" style={{ gridTemplateColumns: '1fr 160px 90px' }}>
                <div>
                  <div className="font-medium text-ink">{a.services.map(s => s.name).join(' + ')}</div>
                  <div className="text-[12px] text-muted">{a.stylistId?.name ?? '—'} · {fmtApptDate(a.start)}</div>
                </div>
                <div className="text-right font-medium text-ink">{formatMoney(a.price)}</div>
                <div className="flex justify-end">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: STATUS_COLOR[a.status] + '22', color: STATUS_COLOR[a.status] }}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Upcoming ────────────────────────────────────────────────────────────────

function UpcomingSection({ appointments, loading, formatMoney }: SectionProps) {
  const now = new Date();
  const upcoming = appointments.filter(a => ['booked', 'confirmed'].includes(a.status) && new Date(a.start) > now);

  return (
    <>
      <SectionHead
        eyebrow="Upcoming"
        title={<>Ce qui est <em className="italic font-normal text-champagne-deep">réservé</em>.</>}
        sub={`${upcoming.length} rendez-vous à venir · Annulation gratuite jusqu'à 24h avant.`}
        cta={<BookBtn label="Réserver une autre" />}
      />
      {loading ? (
        <div className="rounded-card border border-line bg-surface p-12 text-center text-[13px] text-muted animate-pulse">
          Chargement…
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-12 text-center">
          <div className="mb-2 font-serif text-[26px] italic text-muted">Aucune visite à venir</div>
          <p className="mb-6 text-[13px] text-muted mx-auto max-w-sm leading-relaxed">
            Réservez votre prochaine séance et elle apparaîtra ici avec tous les détails.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink no-underline"
          >
            <CalendarPlus size={14} /> Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {upcoming.map(a => (
            <div
              key={a._id}
              className="rounded-card border border-line bg-surface p-7"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-serif text-[22px] font-medium italic" style={{ letterSpacing: '-0.01em' }}>
                    {a.services.map(s => s.name).join(' + ')}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">
                    avec <strong className="text-ink">{a.stylistId?.name ?? '—'}</strong> · {fmtApptDate(a.start)}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{ background: STATUS_COLOR[a.status] + '22', color: STATUS_COLOR[a.status] }}
                >
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="font-serif italic text-[20px] text-champagne-deep">{formatMoney(a.price)}</span>
                <div className="flex gap-2.5 text-[12px]">
                  <span className="text-muted">Règlement en salon · aucun pré-paiement</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── History ─────────────────────────────────────────────────────────────────

function HistorySection({ appointments, loading, formatMoney }: SectionProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const now = new Date();
  const past = appointments.filter(a => {
    const isPast = new Date(a.start) < now || ['completed', 'cancelled', 'noshow'].includes(a.status);
    if (!isPast) return false;
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'cancelled') return a.status === 'cancelled' || a.status === 'noshow';
    return true;
  });
  const totalSpent = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + a.price, 0);

  return (
    <>
      <SectionHead
        eyebrow="Historique des visites"
        title={<>Chaque <em className="italic font-normal text-champagne-deep">visite</em>, archivée.</>}
        sub={`${appointments.filter(a => a.status === 'completed').length} visite${appointments.filter(a => a.status === 'completed').length !== 1 ? 's' : ''} passée${appointments.filter(a => a.status === 'completed').length !== 1 ? 's' : ''} · ${formatMoney(totalSpent)} dépensé au total`}
        cta={
          <button className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-4 py-2.5 text-[13px] text-ink transition-all hover:border-lineStrong hover:bg-[#f6f0e3]">
            <Download size={13} /> Exporter PDF
          </button>
        }
      />
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-6 py-[18px]">
          <h3 className="font-serif text-[22px] font-medium">
            Toutes les <em className="italic font-normal text-champagne-deep">visites</em>
          </h3>
          <div className="flex gap-1.5">
            {(['all', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1 text-[11px] transition-all ${
                  filter === f ? 'border-ink bg-ink text-surface' : 'border-line text-muted hover:border-lineStrong'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'completed' ? 'Terminé' : 'Annulé'}
              </button>
            ))}
          </div>
        </div>
        {/* Table head */}
        <div
          className="grid items-center gap-4 bg-[#f6f0e3] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted"
          style={{ gridTemplateColumns: '1fr 160px 110px 90px 36px' }}
        >
          <span>Service</span><span>Avec · Date</span>
          <span className="text-right">Montant</span><span>Statut</span><span />
        </div>
        {loading ? (
          <div className="py-10 text-center text-[13px] text-muted animate-pulse">Chargement…</div>
        ) : past.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-muted">
            Aucune visite enregistrée pour l'instant.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {past.map(a => (
              <div
                key={a._id}
                className="grid items-center gap-4 px-6 py-4 text-[13px] hover:bg-[#f9f5ed] transition-colors"
                style={{ gridTemplateColumns: '1fr 160px 110px 90px 36px' }}
              >
                <div>
                  <div className="font-medium text-ink truncate">{a.services.map(s => s.name).join(' + ')}</div>
                  <div className="text-[11px] text-muted">{a.services.reduce((n, s) => n + s.durationMin, 0)} min</div>
                </div>
                <div>
                  <div className="text-ink">{a.stylistId?.name ?? '—'}</div>
                  <div className="text-[11px] text-muted">{fmtApptDate(a.start)}</div>
                </div>
                <div className="text-right font-medium text-ink">{formatMoney(a.price)}</div>
                <div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: STATUS_COLOR[a.status] + '22', color: STATUS_COLOR[a.status] }}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button className="text-muted opacity-50 hover:opacity-100 transition-opacity">
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Payments ────────────────────────────────────────────────────────────────

function PaymentsSection() {
  return (
    <>
      <SectionHead
        eyebrow="Paiements"
        title={<>Cartes, <em className="italic font-normal text-champagne-deep">facturation</em>.</>}
        sub="Gérez vos cartes enregistrées et consultez chaque transaction."
        cta={
          <button className="flex items-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink">
            <span className="text-lg leading-none">+</span> Ajouter une carte
          </button>
        }
      />

      {/* Payment cards */}
      <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Add card placeholder */}
        <div className="flex min-h-[180px] items-center justify-center rounded-card border-2 border-dashed border-line bg-surface text-center">
          <div>
            <CreditCard size={28} className="mx-auto mb-3 text-muted opacity-50" />
            <div className="text-[13px] text-muted">Aucune carte enregistrée</div>
            <button className="mt-3 text-[12px] font-medium text-champagne-deep hover:underline">
              Ajouter une carte →
            </button>
          </div>
        </div>
        {/* Summary */}
        <div className="flex flex-col justify-center gap-1.5 rounded-card border border-line bg-surface px-6 py-[22px]">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted">Depuis le début</div>
          <div className="font-serif text-[36px] font-medium leading-none" style={{ letterSpacing: '-0.02em' }}>
            0 <span className="font-normal italic text-champagne-deep text-[22px]">TND</span>
          </div>
          <div className="mt-1 text-[11px] text-muted">sur 0 transaction(s)</div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-6 py-[18px]">
          <h3 className="font-serif text-[22px] font-medium">
            Toutes les <em className="italic font-normal text-champagne-deep">transactions</em>
          </h3>
          <div className="flex gap-1.5">
            {['2026', '2025', 'Tout'].map((y, i) => (
              <button
                key={y}
                className={`rounded-full border px-3 py-1 text-[11px] transition-all ${
                  i === 0 ? 'border-ink bg-ink text-surface' : 'border-line text-muted hover:border-lineStrong'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="py-10 text-center text-[13px] text-muted">
          Aucune transaction pour l'instant.
        </div>
      </div>
    </>
  );
}

// ─── Preferences ─────────────────────────────────────────────────────────────

function PreferencesSection() {
  const [prefs, setPrefs] = useState({
    sms: true, email: true, marketing: false, reminders: true,
    music: true, drinks: true, chitchat: false, fragrance: true,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  return (
    <>
      <SectionHead
        eyebrow="Préférences"
        title={<>Comment vous aimez <em className="italic font-normal text-champagne-deep">être choyé(e)</em>.</>}
        sub="Nous mémorisons pour que votre styliste n'ait pas à demander deux fois."
      />

      {/* Service notes */}
      <ProfileCard>
        <CardTitle>Notes de <em className="italic text-champagne-deep">service</em></CardTitle>
        <p className="mb-4 -mt-3 text-[13px] text-muted leading-relaxed max-w-lg">
          Informations visibles par chaque styliste avant votre séance. Ajoutez allergies, sensibilités ou tout ce qui nous aidera.
        </p>
        <div className="flex min-h-12 flex-wrap gap-1.5 rounded-[10px] border border-line bg-[#ede4d2] p-2.5">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] text-surface">
              {t}
              <button onClick={() => setTags(ts => ts.filter(x => x !== t))} className="opacity-70 hover:opacity-100">
                <span className="text-[10px]">✕</span>
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) {
                setTags(ts => [...ts, tagInput.trim()]);
                setTagInput('');
              }
            }}
            placeholder="Ajouter une note + Entrée…"
            className="min-w-[160px] flex-1 border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
          />
        </div>
      </ProfileCard>

      {/* In the chair */}
      <ProfileCard>
        <CardTitle>Dans le <em className="italic text-champagne-deep">fauteuil</em></CardTitle>
        <p className="mb-4 -mt-3 text-[13px] text-muted leading-relaxed max-w-lg">
          Ces petits conforts font la différence. Nous les honorons à chaque visite.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { k: 'music'    as const, n: 'Playlist de fond',       s: 'Jazz, sans voix' },
            { k: 'drinks'   as const, n: 'Service boissons',       s: 'Eau pétillante, sans caféine' },
            { k: 'chitchat' as const, n: 'Styliste conversationnel',s: 'Préférez une visite calme' },
            { k: 'fragrance'as const, n: 'Parfum salon',           s: 'Subtil est le bienvenu' },
          ].map(p => (
            <PrefRow key={p.k} name={p.n} sub={p.s} on={prefs[p.k]} onToggle={() => toggle(p.k)} />
          ))}
        </div>
      </ProfileCard>

      {/* Contact prefs */}
      <ProfileCard>
        <CardTitle>Comment nous <em className="italic text-champagne-deep">vous contacter</em></CardTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { k: 'sms'       as const, n: 'Confirmations SMS',    s: "Réservation + rappels d'arrivée" },
            { k: 'email'     as const, n: 'Reçus par email',      s: 'Envoyé après chaque visite' },
            { k: 'reminders' as const, n: 'Rappel 24h',           s: 'La veille de votre visite' },
            { k: 'marketing' as const, n: 'Newsletter saisonnière',s: 'Six numéros par an, pas plus' },
          ].map(p => (
            <PrefRow key={p.k} name={p.n} sub={p.s} on={prefs[p.k]} onToggle={() => toggle(p.k)} />
          ))}
        </div>
      </ProfileCard>
    </>
  );
}

function PrefRow({ name, sub, on, onToggle }: { name: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-line bg-[#ede4d2] px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-medium text-ink">{name}</span>
        <span className="text-[11px] text-muted">{sub}</span>
      </div>
      {/* Toggle switch */}
      <div
        onClick={onToggle}
        className="relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-colors duration-200"
        style={{ background: on ? '#1c1612' : 'rgba(28,22,18,.22)' }}
      >
        <span
          className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-surface shadow-sm transition-transform duration-200"
          style={{ transform: `translateX(${on ? 16 : 2}px)` }}
        />
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function ProfileSection() {
  const user          = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const [saved, setSaved]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async (values: ProfileForm) => {
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile(values);
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Mise à jour impossible.');
    }
  };

  return (
    <>
      <SectionHead
        eyebrow="Profil"
        title={<>Vos <em className="italic font-normal text-champagne-deep">coordonnées</em>.</>}
        sub="Gardez-les à jour — nous les utilisons pour les rappels SMS et les reçus."
        cta={
          <button
            form="profile-form"
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="flex items-center gap-2 rounded-[10px] bg-ink px-[18px] py-[10px] text-[13px] font-medium text-surface transition-all hover:bg-champagne hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={13} /> Enregistrer
          </button>
        }
      />

      <ProfileCard>
        <CardTitle>Informations <em className="italic text-champagne-deep">personnelles</em></CardTitle>
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FancyField label="Nom complet" error={errors.name?.message}>
              <input {...register('name')} />
            </FancyField>
            <FancyField label="Email" error={errors.email?.message}>
              <input type="email" {...register('email')} />
            </FancyField>
            <FancyField label="Téléphone" error={errors.phone?.message}>
              <input type="tel" {...register('phone')} />
            </FancyField>
            <FancyField label="Langue préférée">
              <input defaultValue="Français" readOnly />
            </FancyField>
          </div>
          {formError && <p className="mt-3 text-[13px] text-error">{formError}</p>}
          {saved && <p className="mt-3 text-[13px] text-success">Profil mis à jour avec succès.</p>}
        </form>
      </ProfileCard>

      <ProfileCard>
        <CardTitle>Sécurité</CardTitle>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <FancyField label="Mot de passe actuel">
            <input type="password" placeholder="••••••••" />
          </FancyField>
          <FancyField label="Nouveau mot de passe">
            <input type="password" placeholder="8 caractères minimum" />
          </FancyField>
        </div>
        <div className="flex items-center justify-between rounded-[10px] bg-[#ede4d2] border border-line p-3.5">
          <div>
            <div className="font-serif italic text-[16px]">Double authentification</div>
            <div className="mt-1 text-[12px] text-muted">Recommandé · ajoute un code SMS à la connexion</div>
          </div>
          <div
            className="relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full"
            style={{ background: 'rgba(28,22,18,.22)' }}
          >
            <span
              className="absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-surface shadow-sm"
            />
          </div>
        </div>
      </ProfileCard>
    </>
  );
}

function FancyField({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  const [showPwd, setShowPwd] = React.useState(false);
  const isPassword = (children.props as { type?: string }).type === 'password';
  const inputEl = React.cloneElement(children, {
    type: isPassword ? (showPwd ? 'text' : 'password') : (children.props as { type?: string }).type,
    className: `w-full rounded-[10px] border bg-surface py-3.5 text-[14.5px] text-ink outline-none transition-all placeholder:text-muted/60 focus:border-ink focus:bg-ivory ${
      error ? 'border-error' : 'border-line'
    } ${isPassword ? 'pl-4 pr-11' : 'px-4'}`,
    style: { boxShadow: 'none' },
  } as React.HTMLAttributes<HTMLInputElement>);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted">{label}</label>
      <div className="relative">
        {inputEl}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
            aria-label={showPwd ? 'Masquer' : 'Afficher'}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-[11px] text-error">{error}</span>}
    </div>
  );
}

// ─── Loyalty ─────────────────────────────────────────────────────────────────

function LoyaltySection() {
  const POINTS   = 0;
  const NEXT_TIER = 500;
  return (
    <>
      <SectionHead
        eyebrow="Programme de fidélité"
        title={<>Trois <em className="italic font-normal text-champagne-deep">niveaux</em>, une philosophie.</>}
        sub="Gagnez 1 point par 1 TND dépensé. Échangez contre des services, produits ou événements."
      />

      {/* Current standing card */}
      <ProfileCard className="!mb-4" style={{ background: 'linear-gradient(135deg, rgba(184,153,104,.14), transparent 80%)' }}>
        <div className="flex items-baseline justify-between mb-3.5">
          <div>
            <div className="font-serif italic text-[24px]">
              Vous êtes <em className="text-champagne-deep not-italic" style={{ fontStyle: 'italic' }}>Initiée</em>
            </div>
            <div className="mt-1 text-[12px] text-muted tracking-[0.05em]">
              {POINTS} sur {NEXT_TIER} points · {NEXT_TIER - POINTS} pour <strong className="text-champagne-deep">Maison</strong>
            </div>
          </div>
          <div
            className="font-serif font-medium leading-none text-champagne-deep"
            style={{ fontSize: 48, letterSpacing: '-0.02em', fontStyle: 'italic' }}
          >
            {POINTS}
          </div>
        </div>
        <div className="relative h-[14px] overflow-hidden rounded-full bg-[#ede4d2] mb-2">
          <span
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{
              width: `${Math.min((POINTS / NEXT_TIER) * 100, 100)}%`,
              background: 'linear-gradient(to right, #b89968, #8e7142)',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted tracking-[0.06em]">
          <span>0</span><span>500 · Initiée</span><span>1500 · Maison</span><span>2500 · Maître</span>
        </div>
      </ProfileCard>

      {/* Tier cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            tier: 'I. Initiée', pts: '0 — 499', current: true,
            perks: ['5% sur les services', 'Glossing anniversaire', 'Reçus par email'],
          },
          {
            tier: 'II. Maison', pts: '500 — 2499', current: false,
            perks: ['8% sur tout', 'Réservation prioritaire', 'Formule enregistrée', 'Accès anticipé aux événements'],
          },
          {
            tier: 'III. Maître', pts: '2500 +', current: false,
            perks: ['12% de retour', 'Ligne de réservation concierge', 'Box retail trimestrielle', 'Invitations soirées privées'],
          },
        ].map((t, i) => (
          <div
            key={i}
            className="relative rounded-card border px-7 py-[26px]"
            style={{
              background: t.current ? '#1c1612' : '#faf6ee',
              borderColor: t.current ? '#1c1612' : 'rgba(28,22,18,.10)',
              opacity: i === 2 ? 0.7 : 1,
            }}
          >
            {t.current && (
              <div
                className="absolute right-[18px] top-[18px] rounded-full px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em]"
                style={{ background: '#b89968', color: '#1c1612' }}
              >
                Votre niveau
              </div>
            )}
            <h4
              className="mb-1.5 font-serif text-[22px] font-medium"
              style={{ color: t.current ? '#faf6ee' : '#1c1612', letterSpacing: '-0.005em' }}
            >
              {t.tier}
            </h4>
            <div
              className="mb-[18px] text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ color: t.current ? '#b89968' : '#8A8076' }}
            >
              {t.pts} pts
            </div>
            <ul className="flex flex-col gap-2.5 p-0 m-0 list-none">
              {t.perks.map(p => (
                <li key={p} className="flex items-center gap-2.5 text-[13px]"
                  style={{ color: t.current ? 'rgba(243,236,224,.85)' : '#4a3d31' }}
                >
                  <Check
                    size={14}
                    style={{ color: t.current ? '#b89968' : '#8e7142', flexShrink: 0 }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

