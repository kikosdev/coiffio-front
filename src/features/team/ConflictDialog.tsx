import { AlertTriangle, X } from 'lucide-react';
import { Button, Modal } from '@/shared/ui';
import type { LeaveConflict } from './leaveStore';

interface ConflictDialogProps {
  open: boolean;
  onClose: () => void;
  stylistName: string;
  conflicts: LeaveConflict[];
  /** Annule un booking en conflit (réassigner = annuler puis recréer ailleurs). */
  onCancelBooking: (appointmentId: string) => void | Promise<void>;
  busyId?: string | null;
}

/**
 * Dialogue de conflit (#6) : s'ouvre quand l'API renvoie 409 à l'approbation d'un congé.
 * Liste les bookings qui bloquent + action « Annuler » par RDV. Jamais d'auto-résolution :
 * le manager doit libérer les créneaux avant de pouvoir approuver.
 */
export function ConflictDialog({ open, onClose, stylistName, conflicts, onCancelBooking, busyId }: ConflictDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-error">
          <AlertTriangle size={18} /> Approbation bloquée
        </span>
      }
      footer={
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink">
          {conflicts.length} rendez-vous de <strong>{stylistName}</strong> tombent dans la plage demandée.
          Réassignez ou annulez-les, puis ré-approuvez (décision #6 — jamais d'auto-résolution).
        </p>
        <ul className="flex flex-col gap-2">
          {conflicts.map((c) => (
            <li
              key={c.appointmentId}
              className="flex items-center justify-between gap-3 rounded-lg border border-error/30 bg-error/5 px-3 py-2"
            >
              <span className="tabnums text-xs text-ink">
                {new Date(c.start).toLocaleString()} → {new Date(c.end).toLocaleTimeString()}
              </span>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<X size={13} />}
                loading={busyId === c.appointmentId}
                onClick={() => onCancelBooking(c.appointmentId)}
              >
                Annuler
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
