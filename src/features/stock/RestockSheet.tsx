import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/ui';
import { useStockStore, type Product } from './stockStore';

interface RestockSheetProps { product: Product | null; onClose: () => void; }

export function RestockSheet({ product, onClose }: RestockSheetProps) {
  const restock = useStockStore((s) => s.restock);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!product) return null;
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={`Réapprovisionner · ${product.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button loading={submitting} onClick={async () => { setSubmitting(true); try { await restock(product._id, qty, note || undefined); onClose(); } finally { setSubmitting(false); } }}>
            + {qty} en stock
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">Stock actuel : <span className="font-mono text-ink">{product.stock}</span></p>
        <Input label="Quantité (in)" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}
