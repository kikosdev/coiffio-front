import { Button, Modal } from '@/shared/ui';
import { useFinanceStore, type Payment } from './financeStore';

interface RefundDialogProps {
  payment: Payment | null;
  onClose: () => void;
}

/** Refund owner-only (#8). Rendu uniquement quand l'appelant est owner (garde côté ManagerCaisse). */
export function RefundDialog({ payment, onClose }: RefundDialogProps) {
  const refund = useFinanceStore((s) => s.refund);
  if (!payment) return null;
  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      title="Rembourser ce paiement"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={async () => { await refund(payment._id); onClose(); }}>
            Rembourser {payment.amount} TND
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink">
        Le paiement sera marqué remboursé et le Sale contre-passé (rapports cohérents). Action réservée à l'owner (#8).
      </p>
    </Modal>
  );
}
