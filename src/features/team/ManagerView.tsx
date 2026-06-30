import { useEffect, useState } from 'react';
import { Plus, Pencil, UserX } from 'lucide-react';
import { Avatar, Badge, Button, Card, SkeletonList, EmptyState, ErrorState } from '@/shared/ui';
import { useTeamStore, type Staff } from './teamStore';
import { StaffModal } from './StaffModal';
import { RotaEditor } from './RotaEditor';
import { LeaveRequestsPanel } from './LeaveRequestsPanel';

const ROLE_TONE: Record<string, 'champagne' | 'success' | 'neutral'> = {
  owner: 'champagne',
  manager: 'success',
  stylist: 'neutral',
};
const LEVEL_LABEL: Record<string, string> = {
  master: 'Master',
  senior: 'Senior',
  apprentice: 'Apprenti',
};

interface ManagerViewProps {
  isOwner: boolean;
}

/** Vue manager : roster + niveaux, éditeur de rota, file d'approbation des congés (#6). */
export function ManagerView({ isOwner }: ManagerViewProps) {
  const staff = useTeamStore((s) => s.staff);
  const loading = useTeamStore((s) => s.loading);
  const error = useTeamStore((s) => s.error);
  const fetchStaff = useTeamStore((s) => s.fetchStaff);
  const deactivateStaff = useTeamStore((s) => s.deactivateStaff);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (!selectedId && staff.length > 0) {
      const firstStylist = staff.find((s) => s.role === 'stylist') ?? staff[0];
      setSelectedId(firstStylist.id);
    }
  }, [staff, selectedId]);

  const selected = staff.find((s) => s.id === selectedId) ?? null;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (m: Staff) => {
    setEditing(m);
    setModalOpen(true);
  };
  const onDeactivate = async (m: Staff) => {
    if (confirm(`Désactiver le compte de ${m.name} ?`)) await deactivateStaff(m.id);
  };

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">The team</h2>
          <p className="text-sm text-muted">Comptes, niveaux, rotas hebdomadaires &amp; congés.</p>
        </div>
        {isOwner && (
          <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
            Nouveau membre
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          {error ? (
            <ErrorState message={error} onRetry={() => void fetchStaff()} />
          ) : loading && staff.length === 0 ? (
            <SkeletonList rows={5} />
          ) : staff.length === 0 ? (
            <EmptyState label="Aucun membre" sub="Ajoutez votre première équipe." />
          ) : (
            <ul className="divide-y divide-line">
              {staff.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-3 ${selectedId === m.id ? 'bg-line/30' : ''}`}
                >
                  <button onClick={() => setSelectedId(m.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={m.name} size={36} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`truncate text-sm font-medium ${m.isActive ? 'text-ink' : 'text-muted line-through'}`}>
                          {m.name}
                        </span>
                        <Badge tone={ROLE_TONE[m.role] ?? 'neutral'}>{m.role}</Badge>
                        {m.level && <Badge tone="champagne">{LEVEL_LABEL[m.level] ?? m.level}</Badge>}
                      </div>
                      <span className="truncate text-xs text-muted">{m.email}</span>
                    </div>
                  </button>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(m)} className="text-muted hover:text-ink" aria-label="Éditer">
                        <Pencil size={15} />
                      </button>
                      {m.role !== 'owner' && m.isActive && (
                        <button onClick={() => onDeactivate(m)} className="text-muted hover:text-error" aria-label="Désactiver">
                          <UserX size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          {selected ? (
            <>
              <div className="mb-3 flex items-center gap-3">
                <Avatar name={selected.name} size={40} />
                <div>
                  <h3 className="font-serif text-xl text-ink">{selected.name}</h3>
                  <p className="text-xs text-muted">
                    {selected.level ? `${LEVEL_LABEL[selected.level] ?? selected.level} · ` : ''}
                    {(selected.capabilities ?? []).join(', ') || 'Rota & exceptions'}
                  </p>
                </div>
              </div>
              <RotaEditor stylistId={selected.id} canEdit />
            </>
          ) : (
            <Card>
              <p className="px-5 py-10 text-center text-sm text-muted">Sélectionnez un membre.</p>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <LeaveRequestsPanel canApprove />
      </div>

      {isOwner && <StaffModal open={modalOpen} onClose={() => setModalOpen(false)} staff={editing} />}
    </div>
  );
}
