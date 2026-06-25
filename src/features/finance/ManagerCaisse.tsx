import { useEffect, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, SkeletonCard, EmptyState, ErrorState } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useFinanceStore, type Payment } from './financeStore';
import { ExpenseModal } from './ExpenseModal';
import { ReportsPanel } from './ReportsPanel';
import { RefundDialog } from './RefundDialog';


function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-ivory/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl text-ink">{value}</p>
    </div>
  );
}

/** Vue consolidée manager/owner : totaux, par stylist, dépenses, rapports, refunds (owner #8). */
export function ManagerCaisse() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === 'owner';
  const totals = useFinanceStore((s) => s.overviewTotals);
  const byStylist = useFinanceStore((s) => s.byStylist);
  const payments = useFinanceStore((s) => s.overviewPayments);
  const expenses = useFinanceStore((s) => s.expenses);
  const loading = useFinanceStore((s) => s.loading);
  const error = useFinanceStore((s) => s.error);
  const fetchOverview = useFinanceStore((s) => s.fetchOverview);
  const fetchExpenses = useFinanceStore((s) => s.fetchExpenses);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  useEffect(() => {
    void fetchOverview();
    void fetchExpenses();
  }, [fetchOverview, fetchExpenses]);

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5">
        <h2 className="font-serif text-3xl font-medium text-ink">La Caisse</h2>
        <p className="text-sm text-muted">Consolidé du salon · dépenses · rapports.</p>
      </div>

      {error && <ErrorState message={error} onRetry={() => { void fetchOverview(); void fetchExpenses(); }} className="mb-5" />}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading && !totals ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
        ) : (
          <>
            <Figure label="Total" value={`${totals?.gross ?? 0} TND`} />
            <Figure label="Tips" value={`${totals?.tips ?? 0} TND`} />
            <Figure label="Espèces" value={`${totals?.byMethod.cash ?? 0} TND`} />
            <Figure label="Carte" value={`${totals?.byMethod.card ?? 0} TND`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Par stylist</CardTitle></CardHeader>
          <CardBody>
            {byStylist.length === 0 ? (
              <EmptyState label="Aucun encaissement" className="py-4" />
            ) : (
              <ul className="flex flex-col gap-2">
                {byStylist.map((s) => (
                  <li key={s.stylistId} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="text-ink">{s.name}</span>
                    <span className="tabnums font-mono text-ink">{s.gross} TND · {s.tips} tip · {s.commission} comm.</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dépenses</CardTitle>
            <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setExpenseOpen(true)}>Ajouter</Button>
          </CardHeader>
          <CardBody>
            {expenses.length === 0 ? (
              <EmptyState label="Aucune dépense" className="py-4" />
            ) : (
              <ul className="flex flex-col gap-2">
                {expenses.map((e) => (
                  <li key={e._id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="text-ink">{e.category}</span>
                    <span className="flex items-center gap-2">
                      <span className="tabnums font-mono text-ink">{e.amount} TND</span>
                      <button onClick={() => deleteExpense(e._id)} className="text-muted hover:text-error">×</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5">
        <ReportsPanel />
      </div>

      {isOwner && (
        <Card className="mt-5">
          <CardHeader><CardTitle>Paiements du jour (refunds)</CardTitle></CardHeader>
          <CardBody>
            {payments.length === 0 ? (
              <EmptyState label="Aucun paiement" className="py-4" />
            ) : (
              <ul className="flex flex-col gap-2">
                {payments.map((p) => (
                  <li key={p._id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="text-ink">{p.items.map((i) => i.name).join(', ') || '—'}</span>
                    <span className="flex items-center gap-2">
                      <span className="tabnums font-mono text-ink">{p.amount} TND</span>
                      {p.refunded ? (
                        <Badge tone="error">remboursé</Badge>
                      ) : (
                        <Button size="sm" variant="ghost" leftIcon={<RotateCcw size={13} />} onClick={() => setRefundTarget(p)}>
                          Rembourser
                        </Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      {isOwner && <RefundDialog payment={refundTarget} onClose={() => setRefundTarget(null)} />}
    </div>
  );
}
