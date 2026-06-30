import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Input } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/authStore';
import { useCartStore } from './cartStore';

/** Checkout pickup-only (#5) : name+phone+email + créneau pickup → POST /orders. */
export function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const products = useCartStore((s) => s.products);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchProducts = useCartStore((s) => s.fetchProducts);
  const checkout = useCartStore((s) => s.checkout);
  const navigate = useNavigate();

  const DELIVERY_FEE = 7;

  const [form, setForm] = useState({ name: '', phone: '', email: '', pickupAt: '', delivery: false });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchCart();
    if (products.length === 0) void fetchProducts();
  }, [fetchCart, fetchProducts, products.length]);

  useEffect(() => {
    if (user && !form.name) setForm((f) => ({ ...f, name: user.name, phone: user.phone, email: user.email }));
  }, [user, form.name]);

  const nameOf = (id: string) => products.find((p) => p._id === id)?.name ?? 'Produit';
  const subtotal = cart.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const total = subtotal + (form.delivery ? DELIVERY_FEE : 0);
  const valid = form.name.trim() && form.phone.trim() && /\S+@\S+\.\S+/.test(form.email) && cart.items.length > 0;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await checkout({ name: form.name, phone: form.phone, email: form.email, pickupAt: form.pickupAt || undefined, delivery: form.delivery });
      navigate(`/track/order/${order.trackToken}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Commande impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-serif text-3xl text-ink">{form.delivery ? 'Livraison à domicile' : 'Retrait en salon'}</h1>
      <p className="mb-6 text-sm text-muted">Réglez sur place {form.delivery ? 'à la livraison' : 'au retrait'} (V1 sans paiement en ligne).</p>

      <Card className="mb-5">
        <CardBody>
          {cart.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Panier vide.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cart.items.map((i) => (
                <li key={i.productId} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{nameOf(i.productId)} ×{i.qty}</span>
                  <span className="tabnums font-mono text-ink">{i.qty * i.unitPrice} TND</span>
                </li>
              ))}
              {form.delivery && (
                <li className="flex items-center justify-between text-sm">
                  <span className="text-muted">Livraison</span>
                  <span className="tabnums font-mono text-champagne">+{DELIVERY_FEE} TND</span>
                </li>
              )}
              <li className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="text-muted">Total</span>
                <span className="font-serif text-lg text-ink tabnums">{total} TND</span>
              </li>
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Delivery toggle */}
      <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-champagne">
        <input
          type="checkbox"
          checked={form.delivery}
          onChange={(e) => setForm((f) => ({ ...f, delivery: e.target.checked, pickupAt: '' }))}
          className="h-4 w-4 accent-champagne"
        />
        <div>
          <span className="text-sm font-medium text-ink">Livraison à domicile</span>
          <span className="ml-2 rounded-full bg-champagne/15 px-2 py-0.5 text-xs font-mono text-champagne">+{DELIVERY_FEE} TND</span>
        </div>
      </label>

      <div className="flex flex-col gap-3">
        <Input label="Nom complet" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Téléphone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        {!form.delivery && (
          <Input label="Créneau de retrait (optionnel)" type="datetime-local" value={form.pickupAt} onChange={(e) => setForm((f) => ({ ...f, pickupAt: e.target.value }))} />
        )}
        {error && <p className="text-sm text-error">{error}</p>}
        <Button size="lg" onClick={submit} loading={submitting} disabled={!valid}>Confirmer la commande</Button>
      </div>
    </div>
  );
}
