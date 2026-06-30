import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Card, CardBody } from '@/shared/ui';
import { api, ApiError } from '@/shared/api/client';
import type { Order } from './cartStore';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', ready: 'Prête au retrait', picked_up: 'Retirée', cancelled: 'Annulée',
};
const STATUS_TONE: Record<string, 'pending' | 'success' | 'neutral' | 'error'> = {
  pending: 'pending', confirmed: 'pending', ready: 'success', picked_up: 'neutral', cancelled: 'error',
};

/** Suivi public signé d'une commande (#12). */
export function OrderTracking() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<Order>(`/track/order/${token}`).then(setOrder).catch((err) => setError(err instanceof ApiError ? err.message : 'Introuvable'));
  }, [token]);

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-ivory/80 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link to="/shop" className="font-serif text-2xl italic text-ink">SalonOS</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-8 md:px-8">
        <h1 className="mb-5 font-serif text-3xl text-ink">Suivi de commande</h1>
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : !order ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted">Statut</span>
                <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
              </div>
              <ul className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
                {order.items.map((i) => (
                  <li key={i.productId} className="flex justify-between">
                    <span className="text-ink">{i.name} ×{i.qty}</span>
                    <span className="tabnums font-mono text-ink">{i.qty * i.unitPrice} TND</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-muted">Total</span>
                <span className="font-serif text-lg text-ink tabnums">{order.total} TND</span>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
