import { useEffect, useMemo, useState } from 'react';
import { Plus, Clock, Trash2, Pencil } from 'lucide-react';
import { Badge, Button, Card, SkeletonCard, EmptyState, ErrorState } from '@/shared/ui';
import { useServiceStore, type Service, type ServiceGender } from './serviceStore';
import { ServiceModal } from './ServiceModal';

type Filter = 'all' | ServiceGender;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'universal', label: 'Universal' },
];

const GENDER_LABEL: Record<ServiceGender, string> = { women: 'Women', men: 'Men', universal: 'Universal' };
const GENDER_ORDER: ServiceGender[] = ['women', 'men', 'universal'];

/**
 * Catalogue services (Sprint 2) — cartes groupées par genre, filtres men/women/universal,
 * soft-delete via la corbeille. Responsive Ivory Éditorial.
 */
export function ServicesScreen() {
  const items = useServiceStore((s) => s.items);
  const loading = useServiceStore((s) => s.loading);
  const error = useServiceStore((s) => s.error);
  const fetch = useServiceStore((s) => s.fetch);
  const remove = useServiceStore((s) => s.remove);

  const [filter, setFilter] = useState<Filter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const grouped = useMemo(() => {
    const visible = filter === 'all' ? items : items.filter((s) => s.gender === filter);
    const map: Record<ServiceGender, Service[]> = { women: [], men: [], universal: [] };
    visible.forEach((s) => map[s.gender].push(s));
    return map;
  }, [items, filter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setModalOpen(true);
  };
  const onDelete = async (s: Service) => {
    if (confirm(`Archiver « ${s.name} » ? (soft delete)`)) await remove(s._id);
  };

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Services</h2>
          <p className="text-sm text-muted">Catalogue genré — prix, durée &amp; tampon par prestation.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nouveau service
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-ink text-ivory' : 'border border-line text-muted hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => void fetch()} />
      ) : loading && items.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState label="Aucun service" sub="Créez votre premier service." />
      ) : (
        <div className="flex flex-col gap-7">
          {GENDER_ORDER.filter((g) => grouped[g].length > 0).map((g) => (
            <section key={g}>
              <h3 className="mb-3 font-serif text-xl text-ink">
                {GENDER_LABEL[g]} <span className="text-sm text-muted">({grouped[g].length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[g].map((s) => (
                  <Card key={s._id} className="group p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-ink">{s.name}</span>
                          <span className="shrink-0 font-serif text-lg text-ink tabnums">{s.price} TND</span>
                        </div>
                        {s.category && <p className="text-xs text-muted">{s.category}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone="champagne">
                            <Clock size={11} /> {s.durationMin} min
                          </Badge>
                          {s.bufferMin > 0 && <Badge tone="neutral">+{s.bufferMin} tampon</Badge>}
                          {(s.doseConfig?.length ?? 0) > 0 && (
                            <Badge tone="champagne">
                              {s.doseConfig!.length} produit{s.doseConfig!.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(s)}>
                            Éditer
                          </Button>
                          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => onDelete(s)}>
                            Archiver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)} service={editing} />
    </div>
  );
}
