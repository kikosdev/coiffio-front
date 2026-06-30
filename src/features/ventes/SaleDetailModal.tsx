import { useState } from 'react';
import { Modal } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useSalesStore, type Sale } from './salesStore';

interface SaleDetailModalProps {
  sale: Sale;
  onClose: () => void;
}

function RestockConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (restock: boolean) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="w-80 rounded-card bg-surface p-5 shadow-card">
        <h4 className="font-serif text-lg font-medium text-ink">Annuler la vente</h4>
        <p className="mt-2 text-sm text-muted">
          Souhaitez-vous restituer le stock des produits de cette vente ?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => onConfirm(true)}
            className="w-full rounded-xl border border-champagne py-2.5 text-sm font-medium text-ink hover:bg-champagne/10 transition-colors"
          >
            Oui — restituer le stock
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="w-full rounded-xl border border-line py-2.5 text-sm text-muted hover:text-ink transition-colors"
          >
            Non — garder le stock tel quel
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 text-xs text-muted underline hover:text-ink"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

/** Détail d'une vente retail POS + suppression owner-only (#8). */
export function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === 'owner';
  const voidSale = useSalesStore((s) => s.voidSale);

  const [showRestock, setShowRestock] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  const dateStr = new Date(sale.date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleVoidConfirm = async (restock: boolean) => {
    setShowRestock(false);
    setVoiding(true);
    setVoidError(null);
    try {
      await voidSale(sale._id, restock);
      onClose();
    } catch (err) {
      setVoidError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation.');
    } finally {
      setVoiding(false);
    }
  };

  return (
    <>
      <Modal
        open={true}
        onClose={onClose}
        title="Détail de la vente"
        footer={
          isOwner && !sale.voided ? (
            <button
              onClick={() => setShowRestock(true)}
              disabled={voiding}
              className="rounded-xl border border-error px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              {voiding ? 'Annulation…' : 'Supprimer la vente'}
            </button>
          ) : undefined
        }
      >
        {/* Items */}
        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted" style={{ letterSpacing: '0.12em' }}>
            Produits
          </p>
          <ul className="flex flex-col gap-2">
            {sale.items.map((item, idx) => (
              <li key={`${item.refId}-${idx}`} className="flex items-center justify-between text-sm">
                <span
                  className="text-ink"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 15 }}
                >
                  {item.name}
                  <span className="ml-1 text-muted">×{item.qty}</span>
                </span>
                <span className="font-mono tabular-nums text-ink">
                  {(item.qty * item.unitPrice).toFixed(2)} TND
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Récap */}
        <div className="mb-4 space-y-1.5 rounded-xl border border-line bg-ivory/40 px-4 py-3">
          <div className="flex justify-between text-sm text-muted">
            <span>Sous-total</span>
            <span className="font-mono tabular-nums">{(sale.subtotal ?? sale.total).toFixed(2)} TND</span>
          </div>
          {sale.discount && (
            <div className="flex justify-between text-sm text-muted">
              <span>
                Remise{' '}
                {sale.discount.type === 'pct'
                  ? `(${sale.discount.value}%)`
                  : ''}
              </span>
              <span className="font-mono tabular-nums text-error">
                -{sale.discount.computed.toFixed(2)} TND
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium text-ink">
            <span>Total</span>
            <span className="font-mono text-lg tabular-nums">{sale.total.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Méthode</span>
            <span className="text-ink capitalize">{sale.method === 'cash' ? 'Espèces' : 'Carte'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Date</span>
            <span className="text-ink">{dateStr}</span>
          </div>
          {sale.voided && (
            <div className="mt-2 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
              Vente annulée
              {sale.stockRestored && ' · stock restitué'}
            </div>
          )}
        </div>

        {voidError && (
          <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{voidError}</p>
        )}
      </Modal>

      {showRestock && (
        <RestockConfirmModal
          onConfirm={handleVoidConfirm}
          onCancel={() => setShowRestock(false)}
        />
      )}
    </>
  );
}
