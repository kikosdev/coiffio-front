import { useEffect } from 'react';
import { Badge, Button, Card, SkeletonCard, EmptyState, ErrorState } from '@/shared/ui';
import { useOrdersStore, type Order, type OrderStatus } from './ordersStore';

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed', confirmed: 'ready', ready: 'picked_up', picked_up: null, cancelled: null,
};
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente', confirmed: 'Confirmée', ready: 'Prête', picked_up: 'Retirée', cancelled: 'Annulée',
};
const STATUS_TONE: Record<OrderStatus, 'pending' | 'success' | 'neutral' | 'error'> = {
  pending: 'pending', confirmed: 'pending', ready: 'success', picked_up: 'neutral', cancelled: 'error',
};

/** File backoffice des commandes + transitions d'état (Order→Sale à picked_up). */
export function OrdersQueue() {
  const items = useOrdersStore((s) => s.items);
  const loading = useOrdersStore((s) => s.loading);
  const error = useOrdersStore((s) => s.error);
  const fetch = useOrdersStore((s) => s.fetch);
  const setStatus = useOrdersStore((s) => s.setStatus);

  useEffect(() => { void fetch(); }, [fetch]);

  const advance = (o: Order) => { const n = NEXT[o.status]; if (n) void setStatus(o._id, n); };

  return (
    <div className="mx-auto max-w-11xl">
      <h2 className="mb-1 font-serif text-3xl font-medium text-ink">Commandes</h2>
      <p className="mb-5 text-sm text-muted">Retrait en salon · Order→Sale à la remise.</p>
      {error ? (
        <ErrorState message={error} onRetry={() => void fetch()} />
      ) : loading && items.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState label="Aucune commande" sub="Les commandes boutique apparaîtront ici." />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((o) => (
            <Card key={o._id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-ink">{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
                <p className="text-xs text-muted">{o.date.slice(0, 10)} · <span className="font-mono">{o.total} TND</span></p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                {NEXT[o.status] && (
                  <Button size="sm" variant="secondary" onClick={() => advance(o)}>→ {STATUS_LABEL[NEXT[o.status]!]}</Button>
                )}
                {o.status !== 'picked_up' && o.status !== 'cancelled' && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(o._id, 'cancelled')}>Annuler</Button>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
