import { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/shared/ui';
import { api, ApiError } from '@/shared/api/client';
import { useSalesStore } from './salesStore';
import type { Product } from '@/features/stock/stockStore';

interface VenteDrawerProps {
  open: boolean;
  onClose: () => void;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.stock <= 0;

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={[
        'relative rounded-xl border p-3 text-left transition-all',
        outOfStock
          ? 'cursor-not-allowed border-line bg-line/20 opacity-60'
          : 'border-line bg-surface hover:border-champagne hover:shadow-sm active:scale-95',
      ].join(' ')}
    >
      {outOfStock && (
        <span className="absolute right-2 top-2">
          <Badge tone="error">Rupture</Badge>
        </span>
      )}
      <p
        className="truncate text-ink"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 16 }}
      >
        {product.name}
      </p>
      {product.category && (
        <p
          className="mt-0.5 uppercase text-muted"
          style={{ fontSize: 10.5, letterSpacing: '0.18em', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {product.category}
        </p>
      )}
      <p className="mt-2 font-mono text-sm tabular-nums text-ink">
        {product.price.toFixed(2)} TND
      </p>
      <p className="text-xs text-muted">Stock : {product.stock}</p>
    </button>
  );
}

function CartItemRow({
  item,
  onSetQty,
  onRemove,
}: {
  item: { refId: string; name: string; unitPrice: number; qty: number; stock: number };
  onSetQty: (refId: string, qty: number) => void;
  onRemove: (refId: string) => void;
}) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm text-ink"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 15 }}
        >
          {item.name}
        </p>
        <p className="font-mono text-xs tabular-nums text-muted">
          {item.unitPrice.toFixed(2)} TND / u.
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetQty(item.refId, item.qty - 1)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-ink"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center font-mono text-sm tabular-nums text-ink">{item.qty}</span>
        <button
          onClick={() => onSetQty(item.refId, item.qty + 1)}
          disabled={item.qty >= item.stock}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-ink disabled:opacity-40"
        >
          <Plus size={12} />
        </button>
      </div>
      <span className="w-20 text-right font-mono text-sm tabular-nums text-ink">
        {(item.qty * item.unitPrice).toFixed(2)}
      </span>
      <button
        onClick={() => onRemove(item.refId)}
        className="text-muted hover:text-error transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

/** POS retail — panneau latéral. Plein écran < 768px. */
export function VenteDrawer({ open, onClose }: VenteDrawerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'amount' | 'pct'>('amount');
  const [discountValue, setDiscountValue] = useState('');

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draft = useSalesStore((s) => s.draft);
  const method = useSalesStore((s) => s.method);
  const discount = useSalesStore((s) => s.discount);
  const subtotal = useSalesStore((s) => s.subtotal);
  const total = useSalesStore((s) => s.total);
  const addItem = useSalesStore((s) => s.addItem);
  const setQty = useSalesStore((s) => s.setQty);
  const removeItem = useSalesStore((s) => s.removeItem);
  const setDiscount = useSalesStore((s) => s.setDiscount);
  const setMethod = useSalesStore((s) => s.setMethod);
  const submit = useSalesStore((s) => s.submit);
  const resetDraft = useSalesStore((s) => s.resetDraft);

  // Ferme sur Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Recherche produits avec debounce
  useEffect(() => {
    if (!open) return;
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      setLoadingProducts(true);
      try {
        const params: Record<string, string> = { activeOnly: 'true' };
        if (search) params.search = search;
        const items = await api.get<Product[]>('/products', params);
        setProducts(items);
      } catch {
        /* no-op */
      } finally {
        setLoadingProducts(false);
      }
    }, 300);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [open, search]);

  const handleDiscountChange = (val: string) => {
    setDiscountValue(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      setDiscount({ type: discountType, value: n });
    } else {
      setDiscount(null);
    }
  };

  const handleDiscountTypeChange = (t: 'amount' | 'pct') => {
    setDiscountType(t);
    const n = parseFloat(discountValue);
    if (!isNaN(n) && n > 0) {
      setDiscount({ type: t, value: n });
    }
  };

  const handleSubmit = async () => {
    if (draft.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit();
      setDiscountValue('');
      onClose();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Erreur lors de l\'encaissement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetDraft();
    setDiscountValue('');
    setSubmitError(null);
    onClose();
  };

  if (!open) return null;

  const sub = subtotal();
  const tot = total();

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="flex h-full w-full flex-col bg-surface shadow-2xl md:w-[680px]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-serif text-xl font-medium text-ink">Nouvelle vente</h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted hover:bg-line/60 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0 overflow-hidden md:flex-row">
          {/* Catalogue produits */}
          <div className="flex flex-1 flex-col overflow-hidden border-b border-line md:border-b-0 md:border-r">
            <div className="p-3">
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-line bg-ivory/60 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-champagne focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {loadingProducts ? (
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-line/40" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">Aucun produit.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} onAdd={addItem} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panier */}
          <div className="flex w-full flex-col md:w-72 lg:w-80">
            <div className="flex-1 overflow-y-auto p-3">
              {draft.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">Panier vide</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {draft.map((item) => (
                    <CartItemRow
                      key={item.refId}
                      item={item}
                      onSetQty={setQty}
                      onRemove={removeItem}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="border-t border-line p-3 space-y-3">
              {/* Remise */}
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted" style={{ letterSpacing: '0.12em' }}>
                  Remise
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDiscountTypeChange('amount')}
                    className={[
                      'flex-1 rounded-lg border py-1.5 text-xs transition-colors',
                      discountType === 'amount'
                        ? 'border-champagne bg-champagne/10 text-ink'
                        : 'border-line text-muted hover:text-ink',
                    ].join(' ')}
                  >
                    Montant
                  </button>
                  <button
                    onClick={() => handleDiscountTypeChange('pct')}
                    className={[
                      'flex-1 rounded-lg border py-1.5 text-xs transition-colors',
                      discountType === 'pct'
                        ? 'border-champagne bg-champagne/10 text-ink'
                        : 'border-line text-muted hover:text-ink',
                    ].join(' ')}
                  >
                    %
                  </button>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discountValue}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="w-20 rounded-lg border border-line bg-ivory/60 px-2 py-1.5 text-right text-sm font-mono tabular-nums text-ink focus:border-champagne focus:outline-none"
                  />
                </div>
              </div>

              {/* Totaux */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted">
                  <span>Sous-total</span>
                  <span className="font-mono tabular-nums">{sub.toFixed(2)} TND</span>
                </div>
                {discount && discount.value > 0 && (
                  <div className="flex justify-between text-sm text-muted">
                    <span>Remise</span>
                    <span className="font-mono tabular-nums text-error">
                      -{discount.type === 'pct' ? `${discount.value}%` : `${discount.value.toFixed(2)} TND`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-ink">
                  <span>Total</span>
                  <span className="font-mono text-lg tabular-nums">{tot.toFixed(2)} TND</span>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted" style={{ letterSpacing: '0.12em' }}>
                  Paiement
                </p>
                <div className="flex gap-2">
                  {(['cash', 'card'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={[
                        'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                        method === m
                          ? 'border-champagne bg-champagne/10 text-ink'
                          : 'border-line text-muted hover:text-ink',
                      ].join(' ')}
                    >
                      {m === 'cash' ? 'Espèces' : 'Carte'}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && (
                <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{submitError}</p>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={draft.length === 0 || submitting}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: '#B89968' }}
              >
                {submitting ? 'Encaissement…' : `Encaisser la vente · ${tot.toFixed(2)} TND`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
