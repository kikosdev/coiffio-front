import { useEffect, useState } from 'react';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { Avatar, Badge, Button, Card, Input, SkeletonList, EmptyState, ErrorState } from '@/shared/ui';
import { useClientStore, type Client } from './clientStore';
import { ClientModal } from './ClientModal';

/**
 * Liste clients (Sprint 2) — TEMPLATE d'écran CRUD. Recherche scopée, badges
 * guest/registered, modal create/edit. Responsive Ivory Éditorial.
 */
export function ClientsList() {
  const items = useClientStore((s) => s.items);
  const loading = useClientStore((s) => s.loading);
  const error = useClientStore((s) => s.error);
  const query = useClientStore((s) => s.query);
  const setQuery = useClientStore((s) => s.setQuery);
  const fetch = useClientStore((s) => s.fetch);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  // Recherche débouncée (scope appliqué côté backend).
  useEffect(() => {
    const t = setTimeout(() => void fetch(), 250);
    return () => clearTimeout(t);
  }, [query, fetch]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (c: Client) => {
    setEditing(c);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Clients</h2>
          <p className="text-sm text-muted">CRM dual-mode — invités &amp; comptes enregistrés.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nouveau client
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          icon={<Search size={15} />}
          placeholder="Rechercher (nom, téléphone, email)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={() => void fetch()} />
        ) : loading && items.length === 0 ? (
          <SkeletonList rows={6} />
        ) : items.length === 0 ? (
          <EmptyState label="Aucun client" sub="Ajoutez votre premier client." />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((c) => (
              <li key={c._id}>
                <button
                  onClick={() => openEdit(c)}
                  className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-line/30"
                >
                  <Avatar name={c.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-ink">{c.name}</span>
                      <Badge tone={c.registered ? 'success' : 'neutral'}>
                        {c.registered ? 'Registered' : 'Guest'}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted">
                      <span className="inline-flex items-center gap-1 tabnums">
                        <Phone size={12} /> {c.phone}
                      </span>
                      {c.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} /> {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ClientModal open={modalOpen} onClose={() => setModalOpen(false)} client={editing} />
    </div>
  );
}
