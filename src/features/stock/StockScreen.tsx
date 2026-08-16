import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Box, Truck, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Badge, Button, EmptyState } from '@/shared/ui';
import { useStockStore, type Product } from './stockStore';
import { ProductModal } from './ProductModal';
import { RestockSheet } from './RestockSheet';
import { ProduitDetail } from './ProduitDetail';
import { FournisseurModal, type Supplier } from './FournisseurModal';

// ─── Produits tab ────────────────────────────────────────────────────────────

function ProduitsTab() {
  const items = useStockStore((s) => s.items);
  const loading = useStockStore((s) => s.loading);
  const fetch = useStockStore((s) => s.fetch);
  const update = useStockStore((s) => s.update);
  const remove = useStockStore((s) => s.remove);
  const adjustStock = useStockStore((s) => s.adjustStock);

  const [selected, setSelected] = useState<Product | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);

  useEffect(() => { void fetch(); }, [fetch]);

  const filtered = useMemo(
    () =>
      items
        .filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, search],
  );

  // Keep selected in sync with items (after update)
  const selectedFull = items.find((p) => p._id === selected?._id) ?? null;

  function openDetail(p: Product) {
    setSelected(p);
    setMobileOpen(true);
  }

  function handleUpdate(id: string, patch: Partial<Product>) {
    void update(id, patch as Parameters<typeof update>[1]);
  }

  function handleDelete(id: string) {
    void remove(id);
    setSelected(null);
    setMobileOpen(false);
  }

  function handleAdjust(id: string, delta: number) {
    void adjustStock(id, delta);
  }

  const activeItems = filtered.filter((p) => p.active);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[440px_1fr]">
      {/* ── Left: list ── */}
      <div className="flex flex-col rounded-2xl border border-line bg-surface">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-line">
          <div>
            <p className="font-serif text-xl font-medium text-ink">Inventaire des Produits</p>
            <p className="text-xs text-muted mt-0.5">Suivi des niveaux de stock et alertes d'approvisionnement.</p>
          </div>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setModal('add')}>
            Ajouter Produit
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line">
          <Search size={14} className="text-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, catégorie…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-line">
          {loading && activeItems.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Chargement…</p>
          ) : activeItems.length === 0 ? (
            <div className="px-5 py-8">
              <EmptyState label="Aucun produit" sub="Ajoutez votre premier produit." />
            </div>
          ) : (
            activeItems.map((p) => {
              const low = p.stock <= p.lowStockAt;
              const isActive = selectedFull?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => openDetail(p)}
                  className={[
                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                    isActive ? 'bg-ivory' : 'hover:bg-ivory/60',
                    low ? 'border-l-2 border-l-error' : 'border-l-2 border-l-transparent',
                    !p.visibleLanding ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <Box size={16} className="flex-shrink-0 text-muted" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      {p.promo && p.promoPercent > 0 && (
                        <span className="flex-shrink-0 rounded-full bg-champagne/20 px-1.5 py-0.5 text-[10px] font-medium text-champagne">
                          -{p.promoPercent}%{p.promoLabel ? ` · ${p.promoLabel}` : ''}
                        </span>
                      )}
                      {p.isConsumable && (
                        <Badge tone="champagne" className="flex-shrink-0">Consommable</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted truncate">{p.category} · Prix : {p.price} TND</p>
                  </div>

                  {/* Qty controls */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleAdjust(p._id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-lineStrong text-xs text-muted hover:bg-ivory transition-colors"
                    >
                      −
                    </button>
                    <span className={`tabnums w-7 text-center text-sm font-medium ${low ? 'text-error' : 'text-ink'}`}>
                      {p.stock}
                    </span>
                    <button
                      onClick={() => handleAdjust(p._id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-lineStrong text-xs text-muted hover:bg-ivory transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Eye toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(p._id, { visibleLanding: !p.visibleLanding });
                    }}
                    className={`p-1 rounded-md transition-colors ${p.visibleLanding ? 'text-champagne hover:bg-champagne/10' : 'text-muted hover:bg-ivory'}`}
                    title={p.visibleLanding ? 'Masquer de la landing' : 'Afficher sur la landing'}
                  >
                    {p.visibleLanding ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <ChevronRight size={14} className="text-muted flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: detail (desktop only) ── */}
      <div className="hidden lg:block">
        {selectedFull ? (
          <ProduitDetail
            product={selectedFull}
            onEdit={() => setModal(selectedFull)}
            onDelete={() => handleDelete(selectedFull._id)}
            onRestock={() => setRestockTarget(selectedFull)}
            onUpdate={(patch) => handleUpdate(selectedFull._id, patch)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-10 text-center">
            <Box size={40} className="text-muted/40" />
            <p className="text-sm text-muted max-w-xs">
              Sélectionnez un produit pour voir ses détails, gérer sa visibilité et configurer ses promotions.
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile bottom sheet ── */}
      {createPortal(
        <div
          className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${mobileOpen && selectedFull ? 'visible' : 'invisible'}`}
          onClick={() => setMobileOpen(false)}
        >
          <div className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen && selectedFull ? 'opacity-100' : 'opacity-0'}`} />
          <div
            className={`absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-surface transition-transform duration-300 ${mobileOpen && selectedFull ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 flex-shrink-0 rounded-full bg-lineStrong" />
            <div className="flex items-center px-4 py-3 border-b border-line">
              <button onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <ArrowLeft size={16} /> Retour
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedFull && (
                <ProduitDetail
                  product={selectedFull}
                  onEdit={() => { setMobileOpen(false); setModal(selectedFull); }}
                  onDelete={() => handleDelete(selectedFull._id)}
                  onRestock={() => { setMobileOpen(false); setRestockTarget(selectedFull); }}
                  onUpdate={(patch) => handleUpdate(selectedFull._id, patch)}
                />
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Modals */}
      <ProductModal
        open={modal !== null}
        onClose={() => setModal(null)}
        product={modal !== 'add' && modal !== null ? modal : null}
      />
      <RestockSheet product={restockTarget} onClose={() => setRestockTarget(null)} />
    </div>
  );
}

// ─── Fournisseurs tab ─────────────────────────────────────────────────────────

function FournisseurDetail({ f, onDelete }: { f: Supplier; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fiche Fournisseur</p>
        <button
          onClick={onDelete}
          className="h-8 px-3 rounded-lg bg-error/10 text-sm text-error hover:bg-error/20 transition-colors"
        >
          Supprimer
        </button>
      </div>
      <div className="px-5 py-5 flex flex-col gap-3">
        <p className="font-serif text-2xl font-medium text-ink">{f.nom}</p>
        {[
          { label: 'Contact', value: f.contact },
          { label: 'Téléphone', value: f.tel },
          { label: 'Email', value: f.email },
          { label: 'Adresse', value: f.adresse },
        ]
          .filter((r) => r.value)
          .map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-2 text-sm">
              <span className="text-muted w-20 flex-shrink-0">{label} :</span>
              <strong className="text-ink font-medium">{value}</strong>
            </div>
          ))}
        {f.notes && (
          <p className="mt-1 rounded-xl bg-ivory px-4 py-3 text-sm text-muted italic">
            « {f.notes} »
          </p>
        )}
      </div>
    </div>
  );
}

function FournisseursTab() {
  const [fournisseurs, setFournisseurs] = useState<Supplier[]>([]);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(false);

  const selectedFull = fournisseurs.find((f) => f.id === selected?.id) ?? null;

  function addF(data: Omit<Supplier, 'id'>) {
    const f: Supplier = { ...data, id: Date.now() };
    setFournisseurs((p) => [...p, f]);
    setSelected(f);
  }

  function deleteF(id: number) {
    const next = fournisseurs.filter((f) => f.id !== id);
    setFournisseurs(next);
    setSelected(next[0] ?? null);
    setMobileOpen(false);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[440px_1fr]">
      {/* Left: list */}
      <div className="flex flex-col rounded-2xl border border-line bg-surface">
        <div className="flex items-start justify-between px-5 py-4 border-b border-line">
          <div>
            <p className="font-serif text-xl font-medium text-ink">Fournisseurs Enregistrés</p>
            <p className="text-xs text-muted mt-0.5">Coordonnées de vos partenaires logistiques.</p>
          </div>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setModal(true)}>
            Ajouter
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-line">
          {fournisseurs.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Aucun fournisseur enregistré.</p>
          ) : (
            fournisseurs.map((f) => (
              <div
                key={f.id}
                onClick={() => { setSelected(f); setMobileOpen(true); }}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${selectedFull?.id === f.id ? 'bg-ivory' : 'hover:bg-ivory/60'}`}
              >
                <div className="flex items-center gap-3">
                  <Truck size={15} className="text-muted flex-shrink-0" />
                  <span className="text-sm font-medium text-ink">{f.nom}</span>
                </div>
                <ChevronRight size={14} className="text-muted" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: detail (desktop) */}
      <div className="hidden lg:block">
        {selectedFull ? (
          <FournisseurDetail f={selectedFull} onDelete={() => deleteF(selectedFull.id)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-10 text-center">
            <Truck size={36} className="text-muted/40" />
            <p className="text-sm text-muted">Sélectionnez un fournisseur pour voir sa fiche.</p>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {createPortal(
        <div
          className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${mobileOpen && selectedFull ? 'visible' : 'invisible'}`}
          onClick={() => setMobileOpen(false)}
        >
          <div className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen && selectedFull ? 'opacity-100' : 'opacity-0'}`} />
          <div
            className={`absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-surface transition-transform duration-300 ${mobileOpen && selectedFull ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 flex-shrink-0 rounded-full bg-lineStrong" />
            <div className="flex items-center px-4 py-3 border-b border-line">
              <button onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <ArrowLeft size={16} /> Retour
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedFull && (
                <FournisseurDetail f={selectedFull} onDelete={() => deleteF(selectedFull.id)} />
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      <FournisseurModal open={modal} onClose={() => setModal(false)} onSave={addF} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TABS = ['Produits de Revente', 'Fournisseurs (Catalog)'];

export function StockScreen() {
  const [tab, setTab] = useState(0);

  return (
    <div className="mx-auto">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="font-serif text-3xl font-medium text-ink">Boutique · Stock</h2>
        <p className="text-sm text-muted">Catalogue, niveaux de stock &amp; fournisseurs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-line mb-6">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === i
                ? 'border-champagne text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <ProduitsTab />}
      {tab === 1 && <FournisseursTab />}
    </div>
  );
}
