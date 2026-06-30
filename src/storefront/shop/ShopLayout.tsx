import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from './cartStore';
import { CartDrawer } from './CartDrawer';

/** Layout storefront : header + bouton panier + CartDrawer MONTÉ + Outlet. */
export function ShopLayout() {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const count = useCartStore((s) => s.cart.items.reduce((a, i) => a + i.qty, 0));

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-ivory/80 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-11xl items-center gap-3">
          <Link to="/" className="font-serif text-2xl italic text-ink">SalonOS</Link>
          <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
          <nav className="ml-4 flex gap-3 text-sm text-muted">
            <Link to="/shop" className="hover:text-ink">Boutique</Link>
            <Link to="/book" className="hover:text-ink">Réserver</Link>
          </nav>
          <button onClick={openDrawer} className="relative ml-auto rounded-xl border border-line bg-surface p-2 text-ink hover:bg-line/60" aria-label="Panier">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] text-ink">{count}</span>
            )}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-11xl px-5 py-8 md:px-8">
        <Outlet />
      </main>
      <CartDrawer />
    </div>
  );
}
