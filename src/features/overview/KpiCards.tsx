import { Calendar, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import type { OverviewData } from './overviewStore';
import { useMoneyFormatter } from '@/utils/money';

function Kpi({
  label,
  value,
  icon,
  badge,
  badgeCls,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: string;
  badgeCls?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface px-5 py-4 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
        <span className="text-muted/70">{icon}</span>
      </div>
      <p className="mt-3 font-mono text-3xl text-ink">{value}</p>
      {badge && (
        <div className="mt-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeCls}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

function SkeletonKpi() {
  return <div className="h-[108px] animate-pulse rounded-card border border-line bg-surface" />;
}

export function KpiCards({
  kpis,
  alerts,
  loading,
}: {
  kpis?: OverviewData['kpis'];
  alerts?: OverviewData['alerts'];
  loading?: boolean;
}) {
  const formatMoney = useMoneyFormatter();
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
      </div>
    );
  }

  const stockCount = alerts?.lowStock.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Chiffre d'Affaires"
        value={formatMoney(kpis?.revenue ?? 0)}
        icon={<CreditCard size={15} />}
      />
      <Kpi
        label="Rendez-vous du Jour"
        value={`${kpis?.appointments.booked ?? 0}`}
        icon={<Calendar size={15} />}
      />
      <Kpi
        label="Ventes Encaissées"
        value={`${kpis?.appointments.done ?? 0}`}
        icon={<TrendingUp size={15} />}
      />
      <Kpi
        label="Alertes Stock Bas"
        value={`${stockCount}`}
        icon={<AlertTriangle size={15} />}
        badge={stockCount > 0 ? `+${stockCount}` : undefined}
        badgeCls="bg-error/10 text-error"
      />
    </div>
  );
}
