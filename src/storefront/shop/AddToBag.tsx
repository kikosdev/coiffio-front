import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useCartStore } from './cartStore';

/** Bouton "Add to bag" CÂBLÉ à POST /cart/items (piège connu : ne pas oublier le câblage). */
export function AddToBag({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(false);
  return (
    <Button
      size="sm"
      leftIcon={<ShoppingBag size={14} />}
      loading={loading}
      disabled={disabled}
      onClick={async () => { setLoading(true); try { await addItem(productId); } finally { setLoading(false); } }}
    >
      Ajouter
    </Button>
  );
}
