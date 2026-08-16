import { useEffect } from 'react';
import { User, Scissors, Calendar, CreditCard, FlaskConical } from 'lucide-react';
import { Modal, Badge, ErrorState } from '@/shared/ui';
import { useMoneyFormatter } from '@/utils/money';
import { useLossControlStore, varianceTone } from './lossControlStore';

interface InvestigationModalProps {
  appointmentId: string | null;
  onClose: () => void;
}

export function InvestigationModal({ appointmentId, onClose }: InvestigationModalProps) {
  const investigation = useLossControlStore((s) => s.investigation);
  const loading = useLossControlStore((s) => s.investigationLoading);
  const error = useLossControlStore((s) => s.investigationError);
  const fetchInvestigation = useLossControlStore((s) => s.fetchInvestigation);
  const clearInvestigation = useLossControlStore((s) => s.clearInvestigation);
  const formatMoney = useMoneyFormatter();

  useEffect(() => {
    if (appointmentId) void fetchInvestigation(appointmentId);
    return () => clearInvestigation();
  }, [appointmentId, fetchInvestigation, clearInvestigation]);

  const handleClose = () => {
    clearInvestigation();
    onClose();
  };

  return (
    <Modal open={!!appointmentId} onClose={handleClose} title="Investigation du rendez-vous" className="md:w-[560px]">
      {loading && (
        <div className="flex flex-col gap-3 py-6">
          <div className="h-4 w-2/3 animate-pulse rounded-xl bg-line/60" />
          <div className="h-3 w-full animate-pulse rounded-xl bg-line/60" />
          <div className="h-3 w-full animate-pulse rounded-xl bg-line/60" />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => appointmentId && void fetchInvestigation(appointmentId)} />
      )}

      {!loading && !error && investigation && (
        <div className="flex flex-col gap-5">
          {/* Rendez-vous */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-ivory/50 px-4 py-3.5">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <User size={14} className="text-muted" />
              {investigation.appointment.client.name}
              {investigation.appointment.client.phone && (
                <span className="text-xs font-normal text-muted">· {investigation.appointment.client.phone}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink">
              <Scissors size={14} className="text-muted" />
              {investigation.appointment.stylist.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Calendar size={13} />
              {new Date(investigation.appointment.start).toLocaleString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'UTC',
              })}
              <Badge tone="neutral">{investigation.appointment.status}</Badge>
              <Badge tone="neutral">{investigation.appointment.source}</Badge>
            </div>
            {investigation.appointment.services.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {investigation.appointment.services.map((s) => (
                  <span key={s.id} className="rounded-full bg-champagne/15 px-2 py-0.5 text-[11px] font-medium text-champagne-deep">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Doses déclarées */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <FlaskConical size={13} /> Doses déclarées
            </p>
            {investigation.doses.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface px-4 py-3 text-xs text-muted">
                Aucune déclaration de doses pour ce rendez-vous.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-ivory/60 text-left text-[11px] uppercase tracking-wide text-muted">
                      <th className="px-3 py-2 font-medium">Produit</th>
                      <th className="px-3 py-2 text-right font-medium">Déclaré</th>
                      <th className="px-3 py-2 text-right font-medium">Attendu</th>
                      <th className="px-3 py-2 text-right font-medium">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {investigation.doses.map((d) => (
                      <tr key={d.productId}>
                        <td className="px-3 py-2 text-ink">{d.productName}</td>
                        <td className="px-3 py-2 text-right font-mono text-ink">{d.dosesDeclared}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted">{d.dosesExpected}</td>
                        <td className="px-3 py-2 text-right">
                          <Badge tone={varianceTone(d.variancePct)}>{d.variancePct > 0 ? '+' : ''}{d.variancePct.toFixed(0)}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paiement lié */}
          {investigation.payment && (
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-muted">
                <CreditCard size={14} /> {investigation.payment.method}
              </span>
              <span className="font-mono text-ink">{formatMoney(investigation.payment.amount)}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
