import { Link } from 'react-router-dom';
import { AlertTriangle, Package, CalendarX } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import type { OverviewData } from './overviewStore';

/** Alertes cliquables → écran concerné (Stock/Orders/Team). */
export function AlertsPanel({ alerts }: { alerts: OverviewData['alerts'] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Alertes</CardTitle></CardHeader>
      <CardBody className="flex flex-col gap-2">
        <Link to="/boutique" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:border-champagne">
          <span className="flex items-center gap-2 text-ink"><Package size={15} /> Stock bas</span>
          <span className="font-mono text-error">{alerts.lowStock.length}</span>
        </Link>
        {alerts.lowStock.length > 0 && (
          <ul className="ml-6 flex flex-col gap-1 text-xs text-muted">
            {alerts.lowStock.map((p) => (
              <li key={p.productId}>{p.name} — <span className="font-mono">{p.stock}</span></li>
            ))}
          </ul>
        )}
        <Link to="/orders" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:border-champagne">
          <span className="flex items-center gap-2 text-ink"><AlertTriangle size={15} /> Commandes en attente</span>
          <span className="font-mono text-pending">{alerts.pendingOrders}</span>
        </Link>
        <Link to="/team" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:border-champagne">
          <span className="flex items-center gap-2 text-ink"><CalendarX size={15} /> Demandes de congé</span>
          <span className="font-mono text-pending">{alerts.leaveRequests}</span>
        </Link>
      </CardBody>
    </Card>
  );
}
