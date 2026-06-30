import { useEffect } from 'react';
import { Badge, Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import { useStockStore } from './stockStore';

export function MovementsPanel() {
  const movements = useStockStore((s) => s.movements);
  const fetchMovements = useStockStore((s) => s.fetchMovements);
  useEffect(() => { void fetchMovements(); }, [fetchMovements]);
  return (
    <Card>
      <CardHeader><CardTitle>Mouvements de stock</CardTitle></CardHeader>
      <CardBody>
        {movements.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Aucun mouvement.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {movements.map((m) => (
              <li key={m._id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span className="tabnums text-muted">{m.date.slice(0, 10)}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={m.type === 'in' ? 'success' : 'error'}>{m.type === 'in' ? '+' : '-'}{m.qty}</Badge>
                  <span className="text-muted">{m.note}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
