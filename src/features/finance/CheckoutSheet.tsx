import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useServiceStore } from '@/features/services/serviceStore';
import { useStockStore } from '@/features/stock/stockStore';
import { useFinanceStore, type PaymentLine } from './financeStore';

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  stylistId: string;
  appointmentId?: string;
  onPaid?: () => void;
}

/** Encaissement : lignes services + produits retail (Sprint 6) + tip + méthode → POST /payments. */
export function CheckoutSheet({ open, onClose, stylistId, appointmentId, onPaid }: CheckoutSheetProps) {
  const services = useServiceStore((s) => s.items);
  const products = useStockStore((s) => s.items);
  const pay = useFinanceStore((s) => s.pay);

  const [lines, setLines] = useState<PaymentLine[]>([]);
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => lines.reduce((a, l) => a + l.qty * l.unitPrice, 0) + tip, [lines, tip]);

  const addService = (id: string) => {
    const s = services.find((x) => x._id === id);
    if (!s) return;
    setLines((p) => [...p, { kind: 'service', refId: s._id, name: s.name, qty: 1, unitPrice: s.price }]);
  };
  const addProduct = (id: string) => {
    const p = products.find((x) => x._id === id);
    if (!p) return;
    setLines((prev) => [...prev, { kind: 'product', refId: p._id, name: p.name, qty: 1, unitPrice: p.price }]);
  };
  const setQty = (i: number, qty: number) => setLines((p) => p.map((l, idx) => (idx === i ? { ...l, qty } : l)));
  const remove = (i: number) => setLines((p) => p.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (lines.length === 0) {
      setError('Ajoutez au moins une ligne.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await pay({ stylistId, appointmentId, items: lines, tip, method });
      setLines([]);
      setTip(0);
      onPaid?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Encaissement impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="md:w-[560px]"
      title="Encaisser"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} loading={submitting}>
            Encaisser {total} TND
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">+ Service</label>
            <select
              onChange={(e) => { if (e.target.value) addService(e.target.value); e.target.value = ''; }}
              className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
            >
              <option value="">Choisir…</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.name} · {s.price}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">+ Produit</label>
            <select
              onChange={(e) => { if (e.target.value) addProduct(e.target.value); e.target.value = ''; }}
              className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
            >
              <option value="">Choisir…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} · {p.price}</option>
              ))}
            </select>
          </div>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted">Aucune ligne.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((l, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <span className="flex-1 truncate text-ink">{l.name}</span>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => setQty(i, Number(e.target.value))}
                  className="h-8 w-14 rounded border border-lineStrong bg-surface px-2 text-sm tabnums"
                />
                <span className="tabnums w-20 text-right text-ink">{l.qty * l.unitPrice} TND</span>
                <button onClick={() => remove(i)} className="text-muted hover:text-error" aria-label="Retirer">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Tip (TND)" type="number" value={tip} onChange={(e) => setTip(Number(e.target.value))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Méthode</label>
            <div className="flex gap-2">
              {(['cash', 'card'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm ${method === m ? 'border-ink bg-ink text-ivory' : 'border-line text-ink'}`}
                >
                  {m === 'cash' ? 'Espèces' : 'Carte'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </Modal>
  );
}
