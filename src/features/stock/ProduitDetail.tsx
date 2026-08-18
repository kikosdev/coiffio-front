import { Eye, Tag } from 'lucide-react';
import { Switch } from '@/shared/ui';
import type { Product } from './stockStore';

const PROMO_LABELS = ['SOLDES', 'NOUVEAUTÉ', 'EXCLUSIF', 'OFFRE LIMITÉE', 'BEST-SELLER'];

function margin(price: number, cost: number): string {
  if (!cost || !price) return '—';
  return `${Math.round(((price - cost) / price) * 100)}%`;
}

interface ProduitDetailProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onRestock: () => void;
  onUpdate: (patch: Partial<Product>) => void;
}

export function ProduitDetail({ product, onEdit, onDelete, onRestock, onUpdate }: ProduitDetailProps) {
  const m = margin(product.price, product.cost);
  const promoPrice =
    product.promo && product.promoPercent > 0
      ? (product.price * (1 - product.promoPercent / 100)).toFixed(2)
      : null;

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Détails du Produit</p>
        <div className="flex gap-2">
          <button
            onClick={onRestock}
            className="h-8 px-3 rounded-lg border border-lineStrong text-sm text-ink hover:bg-ivory transition-colors"
          >
            Réappro.
          </button>
          <button
            onClick={onEdit}
            className="h-8 px-3 rounded-lg border border-lineStrong text-sm text-ink hover:bg-ivory transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="h-8 px-3 rounded-lg bg-error/10 text-sm text-error hover:bg-error/20 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {/* Name + meta */}
        <div>
          <p className="font-serif text-2xl font-medium text-ink">{product.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {product.category}
            {product.barcode && <> · {product.barcode}</>}
            {product.supplier && <> · {product.supplier}</>}
          </p>
          {product.notes && (
            <p className="mt-1.5 text-xs text-muted italic">{product.notes}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'PRIX DE VENTE', value: `${product.price} TND` },
            { label: "COÛT D'ACHAT", value: `${product.cost} TND` },
            { label: 'MARGE BRUTE', value: m, highlight: product.price > product.cost },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="rounded-xl bg-ivory px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">{label}</p>
              <p className={`tabnums text-lg font-medium ${highlight !== undefined ? (highlight ? 'text-success' : 'text-error') : 'text-ink'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Stock actuel</p>
            <p className="text-xs text-muted mt-0.5">Seuil d'alerte : {product.lowStockAt}</p>
          </div>
          <span
            className={`tabnums text-2xl font-semibold ${product.stock <= product.lowStockAt ? 'text-error' : 'text-ink'}`}
          >
            {product.stock}
          </span>
        </div>

        {/* Visibility toggle */}
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={13} className="text-muted" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Visibilité Landing Page</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Afficher sur la page d'accueil</p>
              <p className="mt-0.5 text-xs text-muted">
                {product.visibleLanding
                  ? 'Visible aux clients depuis la boutique.'
                  : 'Masqué — non visible par les clients.'}
              </p>
            </div>
            <Switch
              checked={product.visibleLanding}
              onChange={(v) => onUpdate({ visibleLanding: v })}
              ariaLabel="Afficher sur la page d'accueil"
            />
          </div>
        </div>

        {/* Promo toggle */}
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={13} className="text-muted" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Promotion</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Activer une promotion</p>
              <p className="mt-0.5 text-xs text-muted">
                {product.promo
                  ? `Remise de ${product.promoPercent}% appliquée.`
                  : 'Aucune remise active.'}
              </p>
            </div>
            <Switch
              checked={product.promo}
              onChange={(v) => onUpdate({ promo: v })}
              ariaLabel="Activer une promotion"
            />
          </div>

          {product.promo && (
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-line pt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted">REMISE %</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={product.promoPercent}
                  onChange={(e) => onUpdate({ promoPercent: parseInt(e.target.value, 10) || 0 })}
                  className="h-9 w-20 rounded-lg border border-lineStrong bg-surface px-2 text-sm text-ink outline-none focus:border-champagne"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted">ÉTIQUETTE</label>
                <select
                  value={product.promoLabel}
                  onChange={(e) => onUpdate({ promoLabel: e.target.value })}
                  className="h-9 rounded-lg border border-lineStrong bg-surface px-2 text-sm text-ink outline-none focus:border-champagne"
                >
                  <option value="">Sans étiquette</option>
                  {PROMO_LABELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              {promoPrice && (
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <span className="text-muted">Prix promo :</span>
                  <strong className="tabnums font-mono text-ink">{promoPrice} TND</strong>
                  <span className="tabnums line-through text-muted">{product.price} TND</span>
                  {product.promoLabel && (
                    <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-xs font-medium text-champagne">
                      {product.promoLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Journal */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Journal d'audit du stock
          </p>
          <p className="text-sm text-muted">Aucun mouvement enregistré.</p>
        </div>
      </div>
    </div>
  );
}
