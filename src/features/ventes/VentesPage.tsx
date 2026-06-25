import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState, ErrorState, SkeletonCard } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useSalesStore, type Sale } from './salesStore';
import { VenteDrawer } from './VenteDrawer';
import { SaleDetailModal } from './SaleDetailModal';

type Period = 'day' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
};

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-line bg-ivory/60 p-1">
      {(['day', 'week', 'month'] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            value === p
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-ivory/40 px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-muted" style={{ letterSpacing: '0.18em' }}>
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl tabular-nums text-ink">{value}</p>
    </div>
  );
}

function RetailKpiRow({ sales }: { sales: Sale[] }) {
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const units = sales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);
  const avg = sales.length > 0 ? revenue / sales.length : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <KpiCard label="CA retail" value={`${revenue.toFixed(2)} TND`} />
      <KpiCard label="Unités" value={String(units)} />
      <KpiCard label="Panier moyen" value={`${avg.toFixed(2)} TND`} />
    </div>
  );
}

function BestSellersChart() {
  const bestSellers = useSalesStore((s) => s.bestSellers);

  if (bestSellers.length === 0) {
    return <EmptyState label="Aucune donnée pour cette période" className="py-4" />;
  }

  const max = bestSellers[0]?.qty ?? 1;

  return (
    <ul className="flex flex-col gap-2">
      {bestSellers.slice(0, 5).map((b) => (
        <li key={b.refId} className="flex items-center gap-3">
          <span
            className="shrink-0 text-sm text-ink"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 15 }}
          >
            {b.name}
          </span>
          <div className="flex-1 overflow-hidden rounded-full bg-line/60">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${(b.qty / max) * 100}%`, backgroundColor: '#A84A3A' }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{b.qty} u.</span>
        </li>
      ))}
    </ul>
  );
}

function SaleRow({ sale, onView }: { sale: Sale; onView: (s: Sale) => void }) {
  const itemSummary = sale.items.map((i) => `${i.name} ×${i.qty}`).join(', ') || '—';
  const dateStr = new Date(sale.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-sm hover:bg-ivory/40 transition-colors">
      <div className="min-w-0">
        <p
          className="truncate text-ink"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 16 }}
        >
          {itemSummary}
        </p>
        <p className="mt-0.5 text-xs text-muted">{dateStr}</p>
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <span className="font-mono tabular-nums text-ink">{sale.total.toFixed(2)} TND</span>
        <button
          onClick={() => onView(sale)}
          className="rounded px-2 py-0.5 text-xs text-muted underline hover:text-ink"
        >
          Voir
        </button>
      </div>
    </li>
  );
}

/** Ventes retail POS (Sprint 6). Route /ventes. */
export function VentesPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwnerManager = role === 'owner' || role === 'manager';

  const sales = useSalesStore((s) => s.sales);
  const period = useSalesStore((s) => s.period);
  const isLoading = useSalesStore((s) => s.isLoading);
  const error = useSalesStore((s) => s.error);
  const fetchSales = useSalesStore((s) => s.fetchSales);
  const fetchBestSellers = useSalesStore((s) => s.fetchBestSellers);
  const setPeriod = useSalesStore((s) => s.setPeriod);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    void fetchSales();
    if (isOwnerManager) void fetchBestSellers();
  }, [period, fetchSales, fetchBestSellers, isOwnerManager]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
  };

  return (
    <div className="mx-auto">
      {/* En-tête */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: '#A84A3A' }} />
            <h2 className="font-serif text-3xl font-medium text-ink">Ventes retail</h2>
          </div>
          <p className="text-sm text-muted">Ventes comptoir sans rendez-vous.</p>
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          style={{ backgroundColor: '#B89968' }}
          className="shrink-0 hover:opacity-90"
        >
          Nouvelle vente
        </Button>
      </div>

      {/* Période */}
      <div className="mb-5 max-w-xs">
        <PeriodTabs value={period} onChange={handlePeriodChange} />
      </div>

      {error && (
        <ErrorState
          message={error}
          onRetry={() => { void fetchSales(); }}
          className="mb-5"
        />
      )}

      {/* KPIs */}
      <div className="mb-5">
        {isLoading && sales.length === 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : (
          <RetailKpiRow sales={sales} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Best-sellers */}
        {isOwnerManager && (
          <Card>
            <CardHeader>
              <CardTitle>Best-sellers</CardTitle>
            </CardHeader>
            <CardBody>
              <BestSellersChart />
            </CardBody>
          </Card>
        )}

        {/* Historique */}
        <Card className={isOwnerManager ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardBody>
            {isLoading && sales.length === 0 ? (
              <SkeletonCard lines={3} />
            ) : sales.length === 0 ? (
              <EmptyState label="Aucune vente pour cette période" className="py-4" />
            ) : (
              <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {sales.map((sale) => (
                  <SaleRow key={sale._id} sale={sale} onView={setSelectedSale} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <VenteDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {selectedSale && (
        <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
}
