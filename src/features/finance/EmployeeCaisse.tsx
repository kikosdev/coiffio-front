import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, SkeletonList, EmptyState, ErrorState } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useServiceStore } from '@/features/services/serviceStore';
import { useStockStore } from '@/features/stock/stockStore';
import { useFinanceStore } from './financeStore';
import { CheckoutSheet } from './CheckoutSheet';

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-ivory/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-ink">{value}</p>
    </div>
  );
}

/** Micro-POS employé : encaisse un RDV ; voit SES tips/total du jour (#9). */
export function EmployeeCaisse() {
  const user = useAuthStore((s) => s.user);
  const payments = useFinanceStore((s) => s.myPayments);
  const totals = useFinanceStore((s) => s.myTotals);
  const loading = useFinanceStore((s) => s.loading);
  const error = useFinanceStore((s) => s.error);
  const fetchMyCaisse = useFinanceStore((s) => s.fetchMyCaisse);
  const fetchServices = useServiceStore((s) => s.fetch);
  const services = useServiceStore((s) => s.items);
  const fetchProducts = useStockStore((s) => s.fetch);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    void fetchMyCaisse();
    if (services.length === 0) void fetchServices();
    void fetchProducts();
  }, [fetchMyCaisse, fetchServices, fetchProducts, services.length]);

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Ma Caisse</h2>
          <p className="text-sm text-muted">Vos encaissements &amp; pourboires du jour (#9).</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Encaisser</Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Total" value={`${totals?.gross ?? 0} TND`} />
        <Figure label="Tips" value={`${totals?.tips ?? 0} TND`} />
        <Figure label="Commission" value={`${totals?.commission ?? 0} TND`} />
        <Figure label="RDV encaissés" value={`${totals?.count ?? 0}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Encaissements du jour</CardTitle></CardHeader>
        <CardBody>
          {error ? (
            <ErrorState message={error} onRetry={() => void fetchMyCaisse()} />
          ) : loading && payments.length === 0 ? (
            <SkeletonList rows={3} />
          ) : payments.length === 0 ? (
            <EmptyState label="Aucun encaissement" sub="Vos encaissements du jour apparaîtront ici." />
          ) : (
            <ul className="flex flex-col gap-2">
              {payments.map((p) => (
                <li key={p._id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                  <span className="text-ink">{p.items.map((i) => i.name).join(', ') || '—'}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabnums font-mono text-ink">{p.amount} TND</span>
                    {p.tip > 0 && <Badge tone="champagne">+{p.tip} tip</Badge>}
                    {p.refunded && <Badge tone="error">remboursé</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {user && (
        <CheckoutSheet open={open} onClose={() => setOpen(false)} stylistId={user.id} onPaid={fetchMyCaisse} />
      )}
    </div>
  );
}
