import { useEffect, useState } from 'react';
import { Button, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useStockStore, type Product } from './stockStore';
import { useMoneyFormatter } from '@/utils/money';

const CATEGORIES = ['Shampoo', 'Conditioner', 'Treatment', 'Styling', 'Coloration', 'Soin', 'Autre'];

const SUPPLIERS = [
  "L'Oréal Professionnel",
  'Kérastase',
  'Wella Professionals',
  'Schwarzkopf Professional',
  'Redken',
  'Pureology',
  'Joico',
];

const SEL =
  'h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30';
const LBL = 'flex flex-col gap-1.5';
const LABEL_TEXT = 'text-xs font-medium uppercase tracking-wide text-muted';

interface Empty {
  name: string; category: string; supplier: string;
  price: string; cost: string; stock: string; lowStockAt: string;
  barcode: string; notes: string;
}

const DEFAULTS: Empty = {
  name: '', category: 'Shampoo', supplier: '',
  price: '', cost: '', stock: '10', lowStockAt: '3',
  barcode: '', notes: '',
};

interface ProductModalProps { open: boolean; onClose: () => void; product?: Product | null; }

export function ProductModal({ open, onClose, product }: ProductModalProps) {
  const formatMoney = useMoneyFormatter();
  const create = useStockStore((s) => s.create);
  const update = useStockStore((s) => s.update);
  const isEdit = !!product;

  const [form, setForm] = useState<Empty>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category || 'Shampoo',
        supplier: product.supplier || '',
        price: String(product.price),
        cost: String(product.cost),
        stock: String(product.stock),
        lowStockAt: String(product.lowStockAt),
        barcode: product.barcode || '',
        notes: product.notes || '',
      });
    } else {
      setForm(DEFAULTS);
    }
    setError(null);
  }, [product, open]);

  const set = (k: keyof Empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom du produit est requis.'); return; }
    const price = Number(form.price);
    const cost = Number(form.cost);
    if (isNaN(price) || price < 0) { setError('Prix de vente invalide.'); return; }
    if (isNaN(cost) || cost < 0) { setError("Coût d'achat invalide."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        supplier: form.supplier,
        price,
        cost,
        stock: Number(form.stock) || 0,
        lowStockAt: Number(form.lowStockAt) || 0,
        barcode: form.barcode.trim(),
        notes: form.notes.trim(),
      };
      if (isEdit && product) {
        const { stock: _s, ...updatePayload } = payload;
        await update(product._id, updatePayload);
      } else {
        await create(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de sauvegarder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le produit' : 'Enregistrer un Produit'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" form="product-form" loading={submitting}>Enregistrer</Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="flex flex-col gap-4" noValidate>

        {/* Nom */}
        <div className={LBL}>
          <label className={LABEL_TEXT}>NOM DU PRODUIT *</label>
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Série Expert Shampoo"
            className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30"
          />
        </div>

        {/* Catégorie + Fournisseur */}
        <div className="grid grid-cols-2 gap-3">
          <div className={LBL}>
            <label className={LABEL_TEXT}>CATÉGORIE</label>
            <select value={form.category} onChange={set('category')} className={SEL}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={LBL}>
            <label className={LABEL_TEXT}>FOURNISSEUR</label>
            <select value={form.supplier} onChange={set('supplier')} className={SEL}>
              <option value="">Aucun fournisseur…</option>
              {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Prix + Coût */}
        <div className="grid grid-cols-2 gap-3">
          <div className={LBL}>
            <label className={LABEL_TEXT}>PRIX DE VENTE TTC *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder={formatMoney(0)}
              className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30"
            />
          </div>
          <div className={LBL}>
            <label className={LABEL_TEXT}>COÛT D'ACHAT HT *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={set('cost')}
              placeholder={formatMoney(0)}
              className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30"
            />
          </div>
        </div>

        {/* Stock initial + Alerte */}
        <div className="grid grid-cols-2 gap-3">
          {!isEdit && (
            <div className={LBL}>
              <label className={LABEL_TEXT}>STOCK INITIAL</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={set('stock')}
                className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              />
            </div>
          )}
          <div className={LBL}>
            <label className={LABEL_TEXT}>ALERTE STOCK BAS</label>
            <input
              type="number"
              min="0"
              value={form.lowStockAt}
              onChange={set('lowStockAt')}
              className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
            />
          </div>
        </div>

        {/* Barcode */}
        <div className={LBL}>
          <label className={LABEL_TEXT}>CODE-BARRES / BARCODE</label>
          <input
            value={form.barcode}
            onChange={set('barcode')}
            placeholder="EAN-13 code"
            className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30"
          />
        </div>

        {/* Notes */}
        <div className={LBL}>
          <label className={LABEL_TEXT}>NOTES DE DESCRIPTION</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Usage professionnel ou revente…"
            className="w-full rounded-xl border border-lineStrong bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30 resize-none"
          />
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}
      </form>
    </Modal>
  );
}
