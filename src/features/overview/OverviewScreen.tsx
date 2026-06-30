import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CreditCard, UserPlus, Package, Banknote, Smartphone, Scale, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, Button } from '@/shared/ui';
import { useOverviewStore, type OverviewData } from './overviewStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useMoneyFormatter } from '@/utils/money';
import { KpiCards } from './KpiCards';

// --- Quick action buttons ---
function QuickActions() {
  const actions = [
    { label: 'Nouveau RDV', icon: <CalendarPlus size={14} />, to: '/schedule', primary: true },
    { label: 'Encaisser RDV', icon: <CreditCard size={14} />, to: '/caisse', primary: false },
    { label: 'Ajouter Client', icon: <UserPlus size={14} />, to: '/clients', primary: false },
    { label: 'Ajuster Stock', icon: <Package size={14} />, to: '/boutique', primary: false },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link key={a.to} to={a.to}>
          <Button
            variant={a.primary ? 'primary' : 'secondary'}
            size="sm"
            className={a.primary ? 'bg-champagne-deep border-champagne-deep text-ivory hover:bg-champagne-deep/90' : ''}
            leftIcon={a.icon}
          >
            {a.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

// --- Today's appointments list ---
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  booked: { label: 'Réservé', cls: 'bg-line text-muted' },
  confirmed: { label: 'Confirmé', cls: 'bg-success/10 text-success' },
  completed: { label: 'Terminé', cls: 'bg-success/10 text-success' },
  cancelled: { label: 'Annulé', cls: 'bg-error/10 text-error' },
  noshow: { label: 'Absent', cls: 'bg-error/10 text-error' },
};

function TodayAppointments({ appointments }: { appointments: OverviewData['todayAppointments'] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Rendez-vous aujourd'hui</CardTitle>
          <p className="mt-0.5 text-xs text-muted">Liste chronologique des créneaux planifiés.</p>
        </div>
      </CardHeader>
      <CardBody>
        {appointments.length === 0 ? (
          <p className="py-12 text-center text-sm italic text-muted">
            Aucun rendez-vous planifié pour aujourd'hui.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {appointments.map((apt) => {
              const s = STATUS_CONFIG[apt.status] ?? { label: apt.status, cls: 'bg-line text-muted' };
              const time = new Date(apt.start).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
              });
              return (
                <li key={apt.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="w-14 shrink-0 font-mono text-xs text-muted">{time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{apt.clientName}</p>
                    <p className="truncate text-xs text-muted">
                      {apt.serviceName} · {apt.stylistName}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

// --- Stock alerts widget ---
function StockAlertsWidget({ alerts }: { alerts: OverviewData['alerts']['lowStock'] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-error" />
            <div>
              <CardTitle>Alertes de Stock Bas</CardTitle>
              <p className="mt-0.5 text-xs text-muted">Produits à réapprovisionner.</p>
            </div>
          </div>
          {alerts.length > 0 && (
            <span className="shrink-0 rounded-full bg-champagne/20 px-2.5 py-0.5 text-xs font-medium text-champagne-deep">
              {alerts.length} produit{alerts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {alerts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Aucune alerte stock.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map((p) => {
              const pct = p.lowStockAt > 0 ? Math.min(100, (p.stock / p.lowStockAt) * 100) : 0;
              return (
                <div key={p.productId}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-error" />
                      <span className="truncate text-sm text-ink">{p.name}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-medium text-error">
                      Alerte
                    </span>
                  </div>
                  <div className="ml-4 mt-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-error" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-muted">
                      {p.stock} / {p.lowStockAt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// --- Activity distribution ---
function ActivityDistribution({ rev }: { rev?: OverviewData['revenueByMethod'] }) {
  const formatMoney = useMoneyFormatter();
  const { cash = 0, card = 0, mobile = 0 } = rev ?? {};
  const total = cash + card + mobile;

  const rows = [
    { icon: <Banknote size={14} />, label: 'CA Espèces', value: cash },
    { icon: <CreditCard size={14} />, label: 'CA Carte Bancaire', value: card },
    { icon: <Smartphone size={14} />, label: 'CA Paiements Mobiles', value: mobile },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Distribution de l'Activité</CardTitle>
          <p className="mt-0.5 text-xs text-muted">Répartition des encaissements du jour.</p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted">
                {r.icon}
                {r.label}
              </span>
              <span className="font-mono text-ink">{formatMoney(r.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-3 text-sm font-medium">
            <span className="flex items-center gap-2 text-ink">
              <Scale size={14} />
              Total Encaissé
            </span>
            <span className="font-mono text-ink">{formatMoney(total)}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// --- Main overview screen ---
export function OverviewScreen() {
  const data = useOverviewStore((s) => s.data);
  const date = useOverviewStore((s) => s.date);
  const loading = useOverviewStore((s) => s.loading);
  const fetch = useOverviewStore((s) => s.fetch);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { void fetch(date); }, [date, fetch]);

  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`));
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <div className="mx-auto max-w-11xl space-y-6">
      {/* Greeting + Quick Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-serif text-4xl font-medium text-ink">
            Bonjour,{' '}
            <span className="italic text-champagne-deep">{user?.name ?? 'Styliste'}</span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            Voici l'activité de votre salon pour aujourd'hui, le {capitalizedDate}.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* KPI Cards */}
      <KpiCards kpis={data?.kpis} alerts={data?.alerts} loading={loading && !data} />

      {/* Main 2-column content */}
      {loading && !data ? (
        <p className="py-10 text-center text-sm text-muted">Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodayAppointments appointments={data?.todayAppointments ?? []} />
          </div>
          <div className="flex flex-col gap-5">
            <StockAlertsWidget alerts={data?.alerts?.lowStock ?? []} />
            <ActivityDistribution rev={data?.revenueByMethod} />
          </div>
        </div>
      )}
    </div>
  );
}
