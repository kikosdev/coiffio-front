import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useTeamStore, type Staff, type StaffLevel, type CreateStaffDto, type UpdateStaffDto } from './teamStore';
import { useSettingsStore } from '@/features/settings/settingsStore';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  manager: 'Manager',
  stylist: 'Styliste',
  colorist: 'Coloriste',
  client: 'Client',
};

const EXCLUDED_FROM_STAFF = new Set(['owner', 'client']);

const createSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(4, 'Téléphone requis'),
  role: z.string().min(1, 'Rôle requis'),
  password: z.string().min(6, '6 caractères minimum'),
});
const editSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(4, 'Téléphone requis'),
  role: z.string().min(1, 'Rôle requis'),
});
type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

const CAPS = ['men', 'women', 'universal'] as const;
const CAP_LABEL: Record<string, string> = { men: 'Homme', women: 'Femme', universal: 'Universel' };

interface ProfileState {
  level: StaffLevel;
  capabilities: string[];
  baseRate: number;
  commissionPct: number;
}

interface StaffModalProps {
  open: boolean;
  onClose: () => void;
  staff?: Staff | null;
}

export function StaffModal({ open, onClose, staff }: StaffModalProps) {
  const createStaff = useTeamStore((s) => s.createStaff);
  const updateStaff = useTeamStore((s) => s.updateStaff);
  const roles = useSettingsStore((s) => s.roles);
  const fetchRoles = useSettingsStore((s) => s.fetchRoles);
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!staff;
  const isOwner = staff?.role === 'owner';

  const staffRoles = roles.filter((r) => !EXCLUDED_FROM_STAFF.has(r.name));

  useEffect(() => {
    if (roles.length === 0) void fetchRoles();
  }, [roles.length, fetchRoles]);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    values: { name: '', email: '', phone: '', role: 'stylist', password: '' },
  });
  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      name: staff?.name ?? '',
      phone: staff?.phone ?? '',
      role: (staff?.role === 'owner' ? 'manager' : staff?.role) ?? 'stylist',
    },
  });

  const [profile, setProfile] = useState<ProfileState>({ level: 'senior', capabilities: [], baseRate: 0, commissionPct: 0 });

  useEffect(() => {
    if (staff) {
      setProfile({
        level: staff.level ?? 'senior',
        capabilities: staff.capabilities ?? [],
        baseRate: staff.baseRate ?? 0,
        commissionPct: staff.commissionPct ?? 0,
      });
    } else {
      setProfile({ level: 'senior', capabilities: [], baseRate: 0, commissionPct: 0 });
    }
  }, [staff, open]);

  const toggleCap = (c: string) =>
    setProfile((p) => ({
      ...p,
      capabilities: p.capabilities.includes(c) ? p.capabilities.filter((x) => x !== c) : [...p.capabilities, c],
    }));

  const onCreate = async (v: CreateValues) => {
    setFormError(null);
    try {
      await createStaff({ ...v, ...(!['manager', 'owner', 'client'].includes(v.role) ? profile : {}) } as CreateStaffDto);
      createForm.reset();
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Création impossible.');
    }
  };
  const onEdit = async (v: EditValues) => {
    if (!staff) return;
    setFormError(null);
    try {
      const profilePart = !['manager', 'owner', 'client'].includes(staff.role) ? profile : {};
      await updateStaff(staff.id, (isOwner ? { name: v.name, phone: v.phone } : { ...v, ...profilePart }) as UpdateStaffDto);
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Mise à jour impossible.');
    }
  };

  const submit = isEdit ? editForm.handleSubmit(onEdit) : createForm.handleSubmit(onCreate);
  const createRole = createForm.watch('role');
  const showProfile = isEdit ? staff?.role !== 'manager' && !isOwner : createRole !== 'manager';

  const ProfileFields = (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Profil stylist</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Niveau</label>
          <select
            value={profile.level}
            onChange={(e) => setProfile((p) => ({ ...p, level: e.target.value as StaffLevel }))}
            className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
          >
            <option value="master">Master</option>
            <option value="senior">Senior</option>
            <option value="apprentice">Apprenti</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Capacités</label>
          <div className="flex flex-wrap gap-1.5">
            {CAPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCap(c)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  profile.capabilities.includes(c) ? 'border-ink bg-ink text-ivory' : 'border-line text-ink hover:border-champagne'
                }`}
              >
                {CAP_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Taux de base (TND)"
          type="number"
          value={profile.baseRate}
          onChange={(e) => setProfile((p) => ({ ...p, baseRate: Number(e.target.value) }))}
        />
        <Input
          label="Commission (%)"
          type="number"
          value={profile.commissionPct}
          onChange={(e) => setProfile((p) => ({ ...p, commissionPct: Number(e.target.value) }))}
        />
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le membre' : 'Nouveau membre'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} loading={createForm.formState.isSubmitting || editForm.formState.isSubmitting}>
            {isEdit ? 'Enregistrer' : 'Créer le compte'}
          </Button>
        </>
      }
    >
      {isEdit ? (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Input label="Nom" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Input label="Téléphone" error={editForm.formState.errors.phone?.message} {...editForm.register('phone')} />
          {!isOwner && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Rôle</label>
              <select
                className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
                {...editForm.register('role')}
              >
                {staffRoles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {ROLE_LABELS[r.name] ?? r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isOwner && <p className="text-xs text-muted">Le compte owner ne peut changer de rôle.</p>}
          {showProfile && ProfileFields}
          {formError && <p className="text-sm text-error">{formError}</p>}
        </form>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Input label="Nom complet" error={createForm.formState.errors.name?.message} {...createForm.register('name')} />
          <Input label="Email" type="email" error={createForm.formState.errors.email?.message} {...createForm.register('email')} />
          <Input label="Téléphone" type="tel" error={createForm.formState.errors.phone?.message} {...createForm.register('phone')} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Rôle</label>
              <select
                className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
                {...createForm.register('role')}
              >
                {staffRoles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {ROLE_LABELS[r.name] ?? r.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Mot de passe"
              type="password"
              error={createForm.formState.errors.password?.message}
              {...createForm.register('password')}
            />
          </div>
          {showProfile && ProfileFields}
          {formError && <p className="text-sm text-error">{formError}</p>}
        </form>
      )}
    </Modal>
  );
}
