import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import type { OverviewData } from './overviewStore';

export function TopStylists({ items }: { items: OverviewData['topStylists'] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Top stylistes</CardTitle></CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Aucune donnée.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((s, i) => (
              <li key={s.stylistId} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-ink"><span className="font-serif text-champagne-deep">{i + 1}</span> {s.name}</span>
                <span className="font-mono text-ink">{s.revenue} TND · {s.bookings} RDV</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
