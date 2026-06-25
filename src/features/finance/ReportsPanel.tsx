import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import { useFinanceStore, type Period } from './financeStore';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
];

export function ReportsPanel() {
  const report = useFinanceStore((s) => s.report);
  const fetchReport = useFinanceStore((s) => s.fetchReport);
  const exportCsv = useFinanceStore((s) => s.exportCsv);
  const [period, setPeriod] = useState<Period>('day');

  useEffect(() => {
    void fetchReport(period);
  }, [period, fetchReport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapports</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
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
          <Button size="sm" variant="secondary" leftIcon={<Download size={14} />} onClick={() => exportCsv(period)}>
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {report ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label="Revenu" value={`${report.revenue} TND`} />
            <Figure label="Tips" value={`${report.tips} TND`} />
            <Figure label="Dépenses" value={`${report.expenses} TND`} />
            <Figure label="Net" value={`${report.net} TND`} />
          </div>
        ) : (
          <p className="text-sm text-muted">Chargement…</p>
        )}
      </CardBody>
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-ivory/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg text-ink">{value}</p>
    </div>
  );
}
