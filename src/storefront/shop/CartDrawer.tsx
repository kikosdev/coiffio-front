import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useCartStore } from './cartStore';

/** Tiroir panier — MONTÉ dans le ShopLayout (piège connu : ne pas oublier de le monter). */
export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const products = useCartStore((s) => s.products);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => { void fetchCart(); }, [fetchCart]);

  const nameOf = (id: string) => products.find((p) => p._id === id)?.name ?? 'Produit';
  const stockOf = (id: string) => products.find((p) => p._id === id)?.stock ?? 99;
  const total = cart.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onMouseDown={close}>
      <div className="flex h-full w-full max-w-sm flex-col bg-surface shadow-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-serif text-xl text-ink">Mon panier</span>
          <button onClick={close} className="text-muted hover:text-ink" aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Votre panier est vide.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.items.map((i) => (
                <li key={i.productId} className="flex flex-col gap-2 rounded-lg border border-line px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-ink leading-snug">{nameOf(i.productId)}</span>
                    <button onClick={() => removeItem(i.productId)} className="shrink-0 text-muted hover:text-error" aria-label="Supprimer"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(i.productId, i.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:border-champagne hover:text-ink disabled:opacity-30"
                        aria-label="Diminuer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="tabnums w-6 text-center font-mono text-sm text-ink">{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.productId, i.qty + 1)}
                        disabled={i.qty >= stockOf(i.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:border-champagne hover:text-ink disabled:opacity-30"
                        aria-label="Augmenter"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="tabnums font-mono text-ink">{i.qty * i.unitPrice} TND</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted">Total</span>
            <span className="font-serif text-xl text-ink tabnums">{total} TND</span>
          </div>
          <Link to="/checkout" onClick={close}>
            <Button className="w-full" disabled={cart.items.length === 0}>Passer au retrait</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
