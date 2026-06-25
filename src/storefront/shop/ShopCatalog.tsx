import { useEffect } from 'react';
import { Badge, Card } from '@/shared/ui';
import { useCartStore } from './cartStore';
import { AddToBag } from './AddToBag';

/** Catalogue boutique public. */
export function ShopCatalog() {
  const products = useCartStore((s) => s.products);
  const loading = useCartStore((s) => s.loading);
  const fetchProducts = useCartStore((s) => s.fetchProducts);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl text-ink">La Boutique</h1>
      <p className="mb-6 text-sm text-muted">Retrait en salon · pas de livraison.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && products.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted">Chargement…</p>
        ) : products.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted">Aucun produit disponible.</p>
        ) : (
          products.map((p) => (
            <Card key={p._id} className="flex flex-col gap-3 p-4">
              <div>
                <p className="font-serif text-lg text-ink">{p.name}</p>
                <p className="text-xs text-muted">{p.category || '—'}</p>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-ink">{p.price} TND</span>
                {p.stock > 0 ? <AddToBag productId={p._id} /> : <Badge tone="error">Épuisé</Badge>}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
