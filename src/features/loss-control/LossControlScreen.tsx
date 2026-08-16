import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PackageSearch, Info, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, EmptyState, ErrorState, SkeletonList, SkeletonCard } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { useStockStore } from '@/features/stock/stockStore';
import { useTeamStore } from '@/features/team/teamStore';
import {
  useLossControlStore,
  varianceTone,
  type LossAlert,
  type LossAlertKind,
  type VarianceResult,
  type StaffHonestyRow,
  type ExtremeUsageRow,
  type Period,
} from './lossControlStore';
import { InvestigationModal } from './InvestigationModal';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
];

const PERIOD_LABEL: Record<Period, string> = { day: 'jour', week: 'semaine', month: 'mois' };

const KIND_LABEL: Record<LossAlertKind, string> = {
  stock_variance: 'Écart de stock',
  staff_honesty: 'Honnêteté staff',
  extreme_usage: 'Usage extrême',
};

// ── Alerts ────────────────────────────────────────────────────────────────────

function AlertRow({
  alert,
  productName,
  staffName,
  onMarkRead,
  onInvestigate,
}: {
  alert: LossAlert;
  productName?: string;
  staffName?: string;
  onMarkRead: (id: string) => void;
  onInvestigate: (appointmentId: string) => void;
}) {
  const isPrimary = alert.kind === 'stock_variance';
  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${isPrimary ? 'bg-error/5' : ''}`}>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${alert.severity === 'critical' ? 'bg-error' : 'bg-pending'}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={alert.severity === 'critical' ? 'error' : 'pending'}>
            {alert.severity === 'critical' ? 'Critique' : 'Avertissement'}
          </Badge>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{KIND_LABEL[alert.kind]}</span>
        </div>
        <p className="mt-1 text-sm text-ink">
          {productName && <>Produit <strong>{productName}</strong> — </>}
          {staffName && <>Staff <strong>{staffName}</strong> — </>}
          écart de {alert.variancePct > 0 ? '+' : ''}{alert.variancePct.toFixed(0)}% (seuil {alert.thresholdPct}%)
        </p>
        <p className="mt-0.5 text-xs text-muted">
          Déclaré {alert.declared} / Attendu {alert.expected}
          {' · '}
          {new Date(alert.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {alert.kind === 'extreme_usage' && alert.appointmentId && (
          <Button size="sm" variant="ghost" onClick={() => onInvestigate(alert.appointmentId!)}>
            Voir le RDV
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onMarkRead(alert._id)}>
          Marquer lue
        </Button>
      </div>
    </div>
  );
}

function AlertsSection({
  alerts,
  loading,
  error,
  onRetry,
  onMarkRead,
  onInvestigate,
  productName,
  staffName,
}: {
  alerts: LossAlert[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onMarkRead: (id: string) => void;
  onInvestigate: (appointmentId: string) => void;
  productName: Map<string, string>;
  staffName: Map<string, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <CardTitle>Alertes</CardTitle>
            <p className="mt-0.5 text-xs text-muted">Non lues, triées par date la plus récente.</p>
          </div>
          {alerts.length > 0 && <Badge tone="error">{alerts.length} non lue{alerts.length > 1 ? 's' : ''}</Badge>}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {error ? (
          <div className="p-4"><ErrorState message={error} onRetry={onRetry} /></div>
        ) : loading ? (
          <SkeletonList rows={3} />
        ) : alerts.length === 0 ? (
          <div className="py-10">
            <EmptyState label="Aucune alerte" sub="Tout est en ordre — aucun écart non lu détecté." />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {alerts.map((a) => (
              <AlertRow
                key={a._id}
                alert={a}
                productName={a.productId ? productName.get(a.productId) : undefined}
                staffName={a.stylistId ? staffName.get(a.stylistId) : undefined}
                onMarkRead={onMarkRead}
                onInvestigate={onInvestigate}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Variance (Calc 2 — le détecteur) ───────────────────────────────────────────

function VarianceSection({
  rows,
  loading,
  error,
  onRetry,
  productName,
  period,
}: {
  rows: VarianceResult[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  productName: Map<string, string>;
  period: Period;
}) {
  return (
    <Card className="border-2 border-ink/10">
      <CardHeader>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-ivory">
            <PackageSearch size={14} />
          </div>
          <div>
            <CardTitle>Écarts de stock</CardTitle>
            <p className="mt-0.5 text-xs text-muted">
              Le seul signal non contournable — stock réellement compté vs consommation théorique, sur le {PERIOD_LABEL[period]} en cours.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {error ? (
          <div className="p-4"><ErrorState message={error} onRetry={onRetry} /></div>
        ) : loading ? (
          <div className="p-4"><SkeletonList rows={3} /></div>
        ) : rows.length === 0 ? (
          <div className="py-10">
            <EmptyState
              label="Aucun produit consommable"
              sub="Marquez des produits comme consommables dans Boutique pour activer le suivi des écarts."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-ivory/60 text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-medium">Produit</th>
                  <th className="px-4 py-2.5 text-right font-medium">Théorique</th>
                  <th className="px-4 py-2.5 text-right font-medium">Réel</th>
                  <th className="px-4 py-2.5 text-right font-medium">Écart</th>
                  <th className="px-4 py-2.5 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.productId}>
                    <td className="px-4 py-2.5 text-ink">{productName.get(r.productId) ?? r.productId}</td>
                    {!r.hasBaseline ? (
                      <td colSpan={4} className="px-4 py-2.5 text-right italic text-muted">Jamais inventorié</td>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 text-right font-mono text-muted">{r.stockTheoretical?.toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-ink">{r.stockReal}</td>
                        <td className={`px-4 py-2.5 text-right font-mono ${(r.variance ?? 0) < 0 ? 'text-error' : 'text-ink'}`}>
                          {(r.variance ?? 0) > 0 ? '+' : ''}{r.variance?.toFixed(1)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge tone={varianceTone(r.variancePct ?? 0)}>
                            {(r.variancePct ?? 0) > 0 ? '+' : ''}{(r.variancePct ?? 0).toFixed(0)}%
                          </Badge>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Secondary signals (Calc 1 + Calc 3 — gameable) ─────────────────────────────

function SecondarySignalsSection({
  staffRows,
  staffLoading,
  staffError,
  onRetryStaff,
  staffName,
  extremeRows,
  extremeLoading,
  extremeError,
  onRetryExtreme,
  productName,
  onInvestigate,
}: {
  staffRows: StaffHonestyRow[];
  staffLoading: boolean;
  staffError: string | null;
  onRetryStaff: () => void;
  staffName: Map<string, string>;
  extremeRows: ExtremeUsageRow[];
  extremeLoading: boolean;
  extremeError: string | null;
  onRetryExtreme: () => void;
  productName: Map<string, string>;
  onInvestigate: (appointmentId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-ivory/40 p-4">
      <div className="mb-3 flex items-start gap-2">
        <Info size={14} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Signaux secondaires — indicatif, repose sur les déclarations du staff. Un écart camouflé en déclarant
          pile le théorique n'y apparaît pas ; seul l'écart de stock ci-dessus constitue une preuve.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Staff honesty */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Écart déclaré / théorique par staff</p>
          {staffError ? (
            <ErrorState message={staffError} onRetry={onRetryStaff} className="py-6" />
          ) : staffLoading ? (
            <SkeletonList rows={2} />
          ) : staffRows.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface py-6 text-center text-xs text-muted">
              Aucune déclaration sur cette période.
            </p>
          ) : (
            <div className="divide-y divide-line rounded-xl border border-line bg-surface">
              {staffRows.map((r) => (
                <div key={r.stylistId} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  <span className="min-w-0 truncate text-ink">{staffName.get(r.stylistId) ?? r.stylistId}</span>
                  <span className="shrink-0 text-muted">{r.declared} / {r.expected}</span>
                  <Badge tone={varianceTone(r.variancePct)}>{r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(0)}%</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extreme usage */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Rendez-vous à usage extrême</p>
          {extremeError ? (
            <ErrorState message={extremeError} onRetry={onRetryExtreme} className="py-6" />
          ) : extremeLoading ? (
            <SkeletonList rows={2} />
          ) : extremeRows.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface py-6 text-center text-xs text-muted">
              Aucun rendez-vous suspect sur cette période.
            </p>
          ) : (
            <div className="divide-y divide-line rounded-xl border border-line bg-surface">
              {extremeRows.map((r) => (
                <button
                  key={r.doseLogId}
                  onClick={() => onInvestigate(r.appointmentId)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-ivory"
                >
                  <span className="min-w-0 truncate text-ink">{productName.get(r.productId) ?? r.productId}</span>
                  <span className="shrink-0 text-muted">{r.dosesDeclared} / {r.dosesExpected} (×{r.extremeUsageFactor})</span>
                  <Badge tone="pending">Investiguer</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main content (mounted once we know the module is on) ──────────────────────

function LossControlContent() {
  const [period, setPeriod] = useState<Period>('week');
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);

  const alerts = useLossControlStore((s) => s.alerts);
  const alertsLoading = useLossControlStore((s) => s.alertsLoading);
  const alertsError = useLossControlStore((s) => s.alertsError);
  const fetchAlerts = useLossControlStore((s) => s.fetchAlerts);
  const markAlertRead = useLossControlStore((s) => s.markAlertRead);

  const variance = useLossControlStore((s) => s.variance);
  const varianceLoading = useLossControlStore((s) => s.varianceLoading);
  const varianceError = useLossControlStore((s) => s.varianceError);
  const fetchVariance = useLossControlStore((s) => s.fetchVariance);

  const staffHonesty = useLossControlStore((s) => s.staffHonesty);
  const staffHonestyLoading = useLossControlStore((s) => s.staffHonestyLoading);
  const staffHonestyError = useLossControlStore((s) => s.staffHonestyError);
  const fetchStaffHonesty = useLossControlStore((s) => s.fetchStaffHonesty);

  const extremeUsage = useLossControlStore((s) => s.extremeUsage);
  const extremeUsageLoading = useLossControlStore((s) => s.extremeUsageLoading);
  const extremeUsageError = useLossControlStore((s) => s.extremeUsageError);
  const fetchExtremeUsage = useLossControlStore((s) => s.fetchExtremeUsage);

  const products = useStockStore((s) => s.items);
  const fetchProducts = useStockStore((s) => s.fetch);
  const staff = useTeamStore((s) => s.staff);
  const fetchStaff = useTeamStore((s) => s.fetchStaff);

  useEffect(() => { void fetchAlerts(); }, [fetchAlerts]);
  useEffect(() => { void fetchProducts(); }, [fetchProducts]);
  useEffect(() => { void fetchStaff(); }, [fetchStaff]);
  useEffect(() => { void fetchStaffHonesty(period); }, [period, fetchStaffHonesty]);
  useEffect(() => { void fetchExtremeUsage(period); }, [period, fetchExtremeUsage]);

  const productName = useMemo(() => new Map(products.map((p) => [p._id, p.name])), [products]);
  const staffName = useMemo(() => new Map(staff.map((m) => [m.id, m.name])), [staff]);

  // Calc 2 porte uniquement sur les produits consommables (dosesPerUnit/doseConfig) —
  // un produit retail-only n'a pas de théorique de consommation à comparer.
  const consumableProductIds = useMemo(() => products.filter((p) => p.isConsumable).map((p) => p._id), [products]);
  useEffect(() => {
    if (consumableProductIds.length > 0) void fetchVariance(consumableProductIds, period);
  }, [consumableProductIds, period, fetchVariance]);

  const varianceRows = consumableProductIds.map((id) => variance[id]).filter((v): v is VarianceResult => !!v);

  return (
    <div className="mx-auto max-w-11xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Contrôle des pertes</h2>
          <p className="text-sm text-muted">Détection des écarts de stock et signaux de vigilance.</p>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-full border px-3 py-1 text-xs ${period === p.value ? 'border-ink bg-ink text-ivory' : 'border-line text-ink'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <AlertsSection
        alerts={alerts}
        loading={alertsLoading}
        error={alertsError}
        onRetry={() => void fetchAlerts()}
        onMarkRead={(id) => void markAlertRead(id)}
        onInvestigate={setInvestigatingId}
        productName={productName}
        staffName={staffName}
      />

      <VarianceSection
        rows={varianceRows}
        loading={varianceLoading}
        error={varianceError}
        onRetry={() => consumableProductIds.length > 0 && void fetchVariance(consumableProductIds, period)}
        productName={productName}
        period={period}
      />

      <SecondarySignalsSection
        staffRows={staffHonesty}
        staffLoading={staffHonestyLoading}
        staffError={staffHonestyError}
        onRetryStaff={() => void fetchStaffHonesty(period)}
        staffName={staffName}
        extremeRows={extremeUsage}
        extremeLoading={extremeUsageLoading}
        extremeError={extremeUsageError}
        onRetryExtreme={() => void fetchExtremeUsage(period)}
        productName={productName}
        onInvestigate={setInvestigatingId}
      />

      <InvestigationModal appointmentId={investigatingId} onClose={() => setInvestigatingId(null)} />
    </div>
  );
}

// ── Root: role gate + module-off gate ──────────────────────────────────────────

export function LossControlScreen() {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === 'owner';

  const salon = useSettingsStore((s) => s.salon);
  const fetchSalon = useSettingsStore((s) => s.fetchSalon);

  useEffect(() => {
    if (isOwner && !salon) void fetchSalon();
  }, [isOwner, salon, fetchSalon]);

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-11xl">
        <EmptyState
          icon={ShieldAlert}
          label="Réservé au propriétaire"
          sub="Le contrôle des pertes n'est visible que par le propriétaire du salon."
        />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="mx-auto max-w-11xl">
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const alertsEnabled = salon.lossControl?.alertsEnabled ?? false;

  if (!alertsEnabled) {
    return (
      <div className="mx-auto max-w-11xl">
        <div className="mb-5">
          <h2 className="font-serif text-3xl font-medium text-ink">Contrôle des pertes</h2>
        </div>
        <EmptyState
          icon={ShieldAlert}
          label="Le contrôle des pertes est désactivé"
          sub="Activez la détection des écarts pour commencer à suivre les alertes et les écarts de stock."
          action={
            <Link to="/settings?tab=lossControl">
              <Button size="sm" leftIcon={<SettingsIcon size={14} />}>Aller aux réglages</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <LossControlContent />;
}
