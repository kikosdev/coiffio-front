import { useEffect, useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import { useLeaveStore, type LeaveConflict, type LeaveRequest } from './leaveStore';
import { useTeamStore } from './teamStore';
import { useBookingStore } from '@/features/schedule/bookingStore';
import { ConflictDialog } from './ConflictDialog';
import { LeaveRequestModal } from './LeaveRequestModal';

const STATUS_TONE: Record<LeaveRequest['status'], 'pending' | 'success' | 'error'> = {
  pending: 'pending',
  approved: 'success',
  rejected: 'error',
};

interface LeaveRequestsPanelProps {
  canApprove: boolean; // owner·manager
}

/**
 * File d'approbation des congés / swaps. L'approbation applique le BLOCK + force reassign
 * (#6) : si l'API renvoie 409, le ConflictDialog s'ouvre avec la liste des bookings à libérer.
 */
export function LeaveRequestsPanel({ canApprove }: LeaveRequestsPanelProps) {
  const items = useLeaveStore((s) => s.items);
  const loading = useLeaveStore((s) => s.loading);
  const fetch = useLeaveStore((s) => s.fetch);
  const approve = useLeaveStore((s) => s.approve);
  const reject = useLeaveStore((s) => s.reject);
  const staff = useTeamStore((s) => s.staff);
  const cancelBooking = useBookingStore((s) => s.cancel);

  const [modalOpen, setModalOpen] = useState(false);
  const [dialog, setDialog] = useState<{ requestId: string; stylistName: string; conflicts: LeaveConflict[] } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const nameFor = (id: string) => staff.find((s) => s.id === id)?.name ?? id.slice(-6);

  const onApprove = async (r: LeaveRequest) => {
    const res = await approve(r._id);
    if (res.blocked) {
      setDialog({ requestId: r._id, stylistName: nameFor(r.stylistId), conflicts: res.conflicts });
    }
  };

  const onCancelBooking = async (appointmentId: string) => {
    if (!dialog) return;
    setBusyId(appointmentId);
    try {
      await cancelBooking(appointmentId);
      const res = await approve(dialog.requestId); // retente après libération
      if (res.blocked) {
        setDialog((d) => (d ? { ...d, conflicts: res.conflicts } : d));
      } else {
        setDialog(null); // plus de conflit → approuvé
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>File d'approbation</CardTitle>
          <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
            Demande
          </Button>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {loading && items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Aucune demande.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((r) => (
                <li key={r._id} className="rounded-xl border border-line px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{nameFor(r.stylistId)}</span>
                    <Badge tone="neutral">{r.type === 'leave' ? 'Congé' : 'Échange'}</Badge>
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                    <span className="tabnums text-xs text-muted">
                      {r.range.from} → {r.range.to}
                    </span>
                    {canApprove && r.status === 'pending' && (
                      <div className="ml-auto flex gap-1">
                        <Button size="sm" variant="secondary" leftIcon={<Check size={14} />} onClick={() => onApprove(r)}>
                          Approuver
                        </Button>
                        <Button size="sm" variant="ghost" leftIcon={<X size={14} />} onClick={() => reject(r._id)}>
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                  {r.note && <p className="mt-1 text-xs text-muted">{r.note}</p>}
                  {r.status === 'pending' && r.conflicts.length > 0 && (
                    <p className="mt-2 text-xs text-error">
                      {r.conflicts.length} booking(s) en conflit — à libérer avant approbation (#6).
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <LeaveRequestModal open={modalOpen} onClose={() => setModalOpen(false)} canPickMember={canApprove} />

      <ConflictDialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        stylistName={dialog?.stylistName ?? ''}
        conflicts={dialog?.conflicts ?? []}
        onCancelBooking={onCancelBooking}
        busyId={busyId}
      />
    </>
  );
}
