import { useEffect, useState } from 'react';
import { Check, Plus, Pencil, Trash2, Shield, ShieldCheck, KeyRound, Crown, MapPin, Clock, Phone, Bell, Laptop, Smartphone, Tablet, LogOut, UserRound, Store, Eye, EyeOff } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, Button, Input, Modal } from '@/shared/ui';
import { useSettingsStore, type SalonRole, type BusinessHour } from './settingsStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavigate } from 'react-router-dom';
import api, { ApiError } from '@/shared/api/client';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const SYSTEM_ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  manager: 'Manager',
  stylist: 'Styliste',
  colorist: 'Coloriste',
  client: 'Client',
};

const PERMISSION_GROUPS: Record<string, string[]> = {
  'Tableau de bord': ['overview.view'],
  'Rendez-vous': ['schedule.view', 'schedule.manage'],
  'Clients': ['clients.view', 'clients.manage'],
  'Équipe': ['team.view', 'team.manage'],
  'Services': ['services.view', 'services.manage'],
  'Finance': ['finance.view', 'finance.manage', 'finance.refund'],
  'Stock': ['stock.view', 'stock.manage'],
  'Commandes': ['orders.view', 'orders.manage'],
  'Paramètres': ['settings.view', 'settings.manage'],
  'Rapports': ['reports.view'],
};

const PERMISSION_LABELS: Record<string, string> = {
  'overview.view': 'Consulter',
  'schedule.view': 'Consulter', 'schedule.manage': 'Gérer',
  'clients.view': 'Consulter', 'clients.manage': 'Gérer',
  'team.view': 'Consulter', 'team.manage': 'Gérer (embauche)',
  'services.view': 'Consulter', 'services.manage': 'Gérer',
  'finance.view': 'Consulter', 'finance.manage': 'Gérer', 'finance.refund': 'Rembourser',
  'stock.view': 'Consulter', 'stock.manage': 'Gérer',
  'orders.view': 'Consulter', 'orders.manage': 'Gérer',
  'settings.view': 'Consulter', 'settings.manage': 'Gérer',
  'reports.view': 'Consulter',
};

const ROLE_COLORS = ['#1C1612', '#9A7B4F', '#B89968', '#3F8F6B', '#C9A227', '#B4543E', '#8A8076'];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-champagne-deep' : 'bg-line'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ── Salon tab ─────────────────────────────────────────────────────────────────

function SalonTab() {
  const salon = useSettingsStore((s) => s.salon);
  const saving = useSettingsStore((s) => s.saving);
  const updateSalon = useSettingsStore((s) => s.updateSalon);

  const [info, setInfo] = useState({
    name: '', address: '', phone: '', email: '', timezone: 'Africa/Tunis', currency: 'TND', taxRate: 19,
  });
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!salon) return;
    setInfo({
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      email: salon.email,
      timezone: salon.timezone,
      currency: salon.currency,
      taxRate: salon.taxRate,
    });
    setHours(
      salon.businessHours?.length === 7
        ? [...salon.businessHours]
        : Array.from({ length: 7 }, (_, i) => ({ day: i, isOpen: i !== 0, start: '09:00', end: '18:00' })),
    );
  }, [salon]);

  const patchHour = (day: number, field: keyof BusinessHour, value: boolean | string) =>
    setHours((h) => h.map((r) => (r.day === day ? { ...r, [field]: value } : r)));

  const handleSave = async () => {
    await updateSalon({ ...info, businessHours: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!salon) return <p className="py-10 text-center text-sm text-muted">Chargement…</p>;

  return (
    <div className="space-y-6">
      {/* Informations */}
      <Card>
        <CardHeader><CardTitle>Informations du Salon</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Nom du salon" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
          <Input label="Adresse" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Téléphone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
            <Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Fuseau horaire</label>
              <select
                value={info.timezone}
                onChange={(e) => setInfo({ ...info, timezone: e.target.value })}
                className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              >
                <option value="Africa/Tunis">Africa/Tunis</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Devise</label>
              <select
                value={info.currency}
                onChange={(e) => setInfo({ ...info, currency: e.target.value })}
                className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              >
                <option value="TND">TND</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">Taux de TVA (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={info.taxRate}
                onChange={(e) => setInfo({ ...info, taxRate: Number(e.target.value) })}
                className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Business hours */}
      <Card>
        <CardHeader><CardTitle>Horaires d'Ouverture</CardTitle></CardHeader>
        <CardBody>
          <div className="divide-y divide-line">
            {hours.map((h) => (
              <div key={h.day} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <Toggle checked={h.isOpen} onChange={(v) => patchHour(h.day, 'isOpen', v)} />
                <span className={`w-24 shrink-0 text-sm font-medium ${h.isOpen ? 'text-ink' : 'text-muted'}`}>
                  {DAY_NAMES[h.day]}
                </span>
                {h.isOpen ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="time"
                      value={h.start}
                      onChange={(e) => patchHour(h.day, 'start', e.target.value)}
                      className="h-9 rounded-lg border border-lineStrong bg-surface px-2 font-mono text-sm text-ink outline-none focus:border-champagne"
                    />
                    <span className="text-xs text-muted">—</span>
                    <input
                      type="time"
                      value={h.end}
                      onChange={(e) => patchHour(h.day, 'end', e.target.value)}
                      className="h-9 rounded-lg border border-lineStrong bg-surface px-2 font-mono text-sm text-ink outline-none focus:border-champagne"
                    />
                  </div>
                ) : (
                  <span className="text-sm italic text-muted">Fermé</span>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} leftIcon={saved ? <Check size={15} /> : undefined}>
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}

// ── Role card ─────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  onEdit,
  onDelete,
  isOwner,
}: {
  role: SalonRole;
  onEdit: (r: SalonRole) => void;
  onDelete: (r: SalonRole) => void;
  isOwner: boolean;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
            <div>
              <p className="font-medium text-ink">
                {role.isSystem ? (SYSTEM_ROLE_LABELS[role.name] ?? role.name) : role.name}
              </p>
              {role.isSystem && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                  <ShieldCheck size={10} /> Système
                </span>
              )}
            </div>
          </div>
          {isOwner && !role.isSystem && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(role)}
                className="rounded-lg p-1.5 text-muted hover:bg-line/60 hover:text-ink"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(role)}
                className="rounded-lg p-1.5 text-muted hover:bg-error/10 hover:text-error"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
            const granted = perms.filter((p) => role.permissions.includes(p));
            if (granted.length === 0) return null;
            return (
              <div key={group} className="flex items-start gap-2">
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted w-24 shrink-0">
                  {group}
                </span>
                <div className="flex flex-wrap gap-1">
                  {granted.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-0.5 rounded-full bg-champagne/10 px-1.5 py-0.5 text-[10px] font-medium text-champagne-deep"
                    >
                      <Check size={8} />
                      {PERMISSION_LABELS[p] ?? p.split('.')[1]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {role.permissions.length === 0 && (
            <p className="text-xs italic text-muted">Aucune permission.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── Role modal ────────────────────────────────────────────────────────────────

function RoleModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: SalonRole;
  onClose: () => void;
  onSave: (data: { name: string; permissions: string[]; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(ROLE_COLORS[2]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setColor(initial?.color ?? ROLE_COLORS[2]);
    setSelected(new Set(initial?.permissions ?? []));
  }, [open, initial]);

  const toggle = (p: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(p) ? n.delete(p) : n.add(p);
      return n;
    });

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), permissions: [...selected], color });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le rôle' : 'Créer un rôle'}
      className="md:w-[560px]"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!name.trim()}>
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input label="Nom du rôle" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Réceptionniste" />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Couleur</p>
          <div className="flex gap-2">
            {ROLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-champagne' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Permissions</p>
          <div className="space-y-3">
            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
              <div key={group}>
                <p className="mb-1.5 text-xs font-semibold text-ink">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {perms.map((p) => (
                    <label key={p} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={selected.has(p)}
                        onChange={() => toggle(p)}
                        className="h-3.5 w-3.5 accent-champagne-deep"
                      />
                      <span className="text-xs text-ink">{PERMISSION_LABELS[p] ?? p}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RolesTab() {
  const roles = useSettingsStore((s) => s.roles);
  const createRole = useSettingsStore((s) => s.createRole);
  const updateRole = useSettingsStore((s) => s.updateRole);
  const deleteRole = useSettingsStore((s) => s.deleteRole);
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === 'owner';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SalonRole | undefined>();

  const openCreate = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit = (r: SalonRole) => { setEditing(r); setModalOpen(true); };

  const handleSave = async (data: { name: string; permissions: string[]; color: string }) => {
    if (editing) {
      await updateRole(editing._id, data);
    } else {
      await createRole(data);
    }
  };

  const handleDelete = async (r: SalonRole) => {
    if (!confirm(`Supprimer le rôle "${r.name}" ?`)) return;
    await deleteRole(r._id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-medium text-ink">Rôles &amp; Permissions</h3>
          <p className="text-xs text-muted">Les rôles système ne peuvent pas être supprimés.</p>
        </div>
        {isOwner && (
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
            Créer un rôle
          </Button>
        )}
      </div>

      {roles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Aucun rôle trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <RoleCard key={r._id} role={r} onEdit={openEdit} onDelete={handleDelete} isOwner={isOwner} />
          ))}
        </div>
      )}

      <RoleModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

// ── Account tab helpers ────────────────────────────────────────────────────────

function OASwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-[26px] w-[44px] flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200 ${
        on ? 'border-champagne bg-champagne' : 'border-lineStrong bg-[#ede4d2]'
      }`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full shadow-soft transition-all duration-200 ${
          on ? 'left-[21px] bg-white' : 'left-[3px] bg-surface'
        }`}
      />
    </button>
  );
}

function OAPwdInput({ label, hint, value, onChange, autoComplete }: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}{hint && <em className="ml-1 normal-case not-italic font-normal text-muted/70 tracking-normal">{hint}</em>}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function OATextInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-ink focus:ring-2 focus:ring-ink/10"
      />
    </label>
  );
}

const ACCESS_ROWS = [
  'Planning & réservations', 'La Caisse · finance', 'Services & tarifs',
  'Boutique & stock', 'Équipe & paie', 'Rapports & exports',
];

const NOTIF_ROWS = [
  { k: 'dayDigest',     n: 'Résumé matinal', s: 'Un récap à 08h00 des RDV du jour' },
  { k: 'newBooking',    n: 'Nouveau rendez-vous', s: 'Notification à chaque nouvelle réservation' },
  { k: 'cancellations', n: 'Annulations & no-shows', s: 'Pour re-proposer le créneau rapidement' },
  { k: 'lowStock',      n: 'Alerte stock bas', s: 'Articles boutique sous le seuil minimal' },
  { k: 'payroll',       n: 'Paie & approbations', s: 'Congés et rappels de fin de paie' },
  { k: 'reviews',       n: 'Nouveaux avis clients', s: 'À chaque retour d\'un client' },
] as const;

type NotifKey = typeof NOTIF_ROWS[number]['k'];

const SESSIONS = [
  { device: 'MacBook Pro · Safari', where: 'Salon — Le Marais, Paris', when: 'Actif maintenant', current: true,  Icon: Laptop },
  { device: 'iPhone · Haire app',   where: 'Paris, FR',                when: 'Il y a 2 heures',  current: false, Icon: Smartphone },
  { device: 'iPad · Accueil',       where: 'Salon — Le Marais, Paris', when: 'Hier, 19:40',       current: false, Icon: Tablet },
] as const;

const PORTRAIT_GRADIENT = 'linear-gradient(135deg, #1c1612 0%, #4a3d31 100%)';

// ── Account tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const user        = useAuthStore((s) => s.user);
  const logout      = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const navigate    = useNavigate();

  // ── Personal details
  const [nameParts, setNameParts] = useState(() => {
    const parts = (user?.name ?? '').trim().split(' ');
    return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
  });
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileOk, setProfileOk] = useState(false);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateProfile({ name: `${nameParts.firstName} ${nameParts.lastName}`.trim(), email: profileEmail });
      setProfileOk(true);
      setTimeout(() => setProfileOk(false), 2500);
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password
  const EMPTY_PWD = { current: '', next: '', confirm: '' };
  const [pwd, setPwd] = useState(EMPTY_PWD);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdOk, setPwdOk] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const setPwdField = (k: keyof typeof EMPTY_PWD, v: string) => { setPwd((f) => ({ ...f, [k]: v })); setPwdError(null); };

  const handleChangePwd = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) { setPwdError('Veuillez remplir tous les champs.'); return; }
    if (pwd.next !== pwd.confirm) { setPwdError('Les nouveaux mots de passe ne correspondent pas.'); return; }
    if (pwd.next.length < 6) { setPwdError('Au moins 6 caractères requis.'); return; }
    setPwdBusy(true); setPwdError(null);
    try {
      await api.patch('auth/me/password', { currentPassword: pwd.current, newPassword: pwd.next });
      setPwd(EMPTY_PWD); setPwdOk(true); setTimeout(() => setPwdOk(false), 3000);
    } catch (err: unknown) {
      setPwdError(err instanceof ApiError ? err.message : 'Erreur lors du changement de mot de passe.');
    } finally { setPwdBusy(false); }
  };

  // ── Notifications
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    dayDigest: true, newBooking: false, cancellations: true, lowStock: true, payroll: true, reviews: true,
  });
  const [twoFA, setTwoFA] = useState(true);

  const initial = (user?.name ?? 'U')[0].toUpperCase();
  const roleLabel = user?.role === 'owner' ? 'Propriétaire · Directeur' : user?.role === 'manager' ? 'Manager' : user?.role ?? '—';

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* ── Identity hero ── */}
      <div className="flex items-center gap-5 rounded-card border border-line bg-surface p-5 shadow-soft">
        {/* Avatar */}
        <div
          className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-full shadow-soft"
          style={{ background: PORTRAIT_GRADIENT }}
        >
          <span className="font-serif text-[34px] italic leading-none text-white/95">{initial}</span>
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">{roleLabel}</p>
          <h3 className="mt-0.5 font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.01em] text-ink">
            {nameParts.firstName} <em className="italic text-champagne-deep">{nameParts.lastName}</em>
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[12.5px] text-muted">
            {user?.role === 'owner' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-champagne/15 px-2.5 py-0.5 text-[11px] font-semibold text-champagne-deep">
                <Crown size={11} />Compte propriétaire
              </span>
            )}
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Connecté
            </span>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex flex-shrink-0 gap-7 border-l border-line pl-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Email</span>
            <span className="text-[13px] font-medium text-ink">{user?.email ?? '—'}</span>
          </div>
          {user?.role === 'owner' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Accès</span>
              <span className="text-[13px] font-medium text-ink">Contrôle total</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.15fr_0.85fr] items-start">

        {/* LEFT column */}
        <div className="flex flex-col gap-[18px]">

          {/* Personal details */}
          <div className="rounded-card border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                Détails <em className="italic text-champagne-deep">personnels</em>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
                <UserRound size={11} />Profil
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                <OATextInput label="Prénom" value={nameParts.firstName} onChange={(v) => setNameParts((p) => ({ ...p, firstName: v }))} placeholder="Prénom" />
                <OATextInput label="Nom" value={nameParts.lastName} onChange={(v) => setNameParts((p) => ({ ...p, lastName: v }))} placeholder="Nom de famille" />
                <OATextInput label="Email" type="email" value={profileEmail} onChange={setProfileEmail} placeholder="votre@email.com" />
                <OATextInput label="Rôle" value={roleLabel} onChange={() => {}} placeholder="—" />
              </div>
              <div className="flex justify-end pt-1">
                <Button size="sm" onClick={handleSaveProfile} loading={profileSaving}
                  leftIcon={profileOk ? <Check size={14} /> : undefined}>
                  {profileOk ? 'Enregistré !' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-card border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                <em className="italic text-champagne-deep">Sécurité</em> & connexion
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
                <Shield size={11} />Protégé
              </span>
            </div>
            <div className="p-5 space-y-5">
              {/* Password fields */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                <OAPwdInput label="Mot de passe actuel" value={pwd.current} onChange={(v) => setPwdField('current', v)} autoComplete="current-password" />
                <OAPwdInput label="Nouveau mot de passe" hint="min 6 caractères" value={pwd.next} onChange={(v) => setPwdField('next', v)} autoComplete="new-password" />
                <div className="col-span-2">
                  <OAPwdInput label="Confirmer le nouveau mot de passe" value={pwd.confirm} onChange={(v) => setPwdField('confirm', v)} autoComplete="new-password" />
                </div>
              </div>
              {pwdError && <p className="text-xs text-error">{pwdError}</p>}
              {pwdOk && <p className="text-xs text-success">Mot de passe mis à jour avec succès !</p>}
              <div className="flex justify-end">
                <Button size="sm" onClick={handleChangePwd} loading={pwdBusy}
                  leftIcon={pwdOk ? <Check size={14} /> : <KeyRound size={14} />}>
                  {pwdOk ? 'Enregistré !' : 'Changer le mot de passe'}
                </Button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13.5px] font-medium text-ink">Authentification à deux facteurs</span>
                  <span className="text-[12px] text-muted">Code SMS à chaque nouvelle connexion · fortement recommandé</span>
                </div>
                <OASwitch on={twoFA} onChange={setTwoFA} />
              </div>

              {/* Active sessions */}
              <div className="border-t border-line pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Sessions actives</p>
                <div className="divide-y divide-line">
                  {SESSIONS.map((s) => (
                    <div key={s.device} className="flex items-center gap-3 py-2.5">
                      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[#ede4d2] text-muted">
                        <s.Icon size={16} />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                          {s.device}
                          {s.current && (
                            <span className="rounded-full bg-success/[0.14] px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.1em] text-success">
                              Cet appareil
                            </span>
                          )}
                        </span>
                        <span className="text-[11.5px] text-muted">{s.where} · {s.when}</span>
                      </div>
                      {!s.current && (
                        <button className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-error/40 hover:text-error">
                          <LogOut size={12} />Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-[18px]">

          {/* Role & access */}
          <div className="rounded-card border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                Rôle & <em className="italic text-champagne-deep">accès</em>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-champagne/15 px-2.5 py-1 text-[11px] font-semibold text-champagne-deep">
                <Crown size={11} />Propriétaire
              </span>
            </div>
            <div className="divide-y divide-line px-5">
              {ACCESS_ROWS.map((area) => (
                <div key={area} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-champagne/20 text-champagne-deep">
                    <Check size={12} />
                  </div>
                  <span className="flex-1 text-[13.5px] font-medium text-ink">{area}</span>
                  <span className="text-[11.5px] text-muted">Contrôle total</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-2">
              <p className="text-[12px] leading-[1.55] text-muted">
                En tant que propriétaire, vous avez accès à l'ensemble des fonctionnalités.
                Accordez des rôles limités aux managers depuis{' '}
                <strong className="font-semibold text-ink">Équipe → permissions</strong>.
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-card border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                <em className="italic text-champagne-deep">Notifications</em>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
                <Bell size={11} />{Object.values(notif).filter(Boolean).length} activées
              </span>
            </div>
            <div className="divide-y divide-line px-5">
              {NOTIF_ROWS.map((row) => (
                <div key={row.k} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-ink">{row.n}</span>
                    <span className="text-[12px] text-muted">{row.s}</span>
                  </div>
                  <OASwitch on={notif[row.k]} onChange={(v) => setNotif((prev) => ({ ...prev, [row.k]: v }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Salon record */}
          <div className="rounded-card border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                Le <em className="italic text-champagne-deep">salon</em>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
                <Store size={11} />Établissement
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5">
              {/* Brand mark */}
              <div className="mb-1 flex items-end gap-1">
                <span className="font-serif text-[26px] italic font-medium leading-none text-ink">H</span>
                <span className="mx-1 mb-[5px] h-[5px] w-[5px] rounded-full bg-champagne" />
                <span className="self-center text-[13px] tracking-[0.04em] text-muted">Salon Haire</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-muted">
                <MapPin size={14} className="flex-shrink-0" />
                <span>18 rue de Sévigné, 75004 Paris</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-muted">
                <Clock size={14} className="flex-shrink-0" />
                <span>Mar–Sam · 09:00 – 19:00</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-muted">
                <Phone size={14} className="flex-shrink-0" />
                <span>+33 1 42 72 00 18</span>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-card border border-line bg-surface py-3.5 text-[13px] font-medium text-error transition-all hover:border-error/40 hover:bg-error/5"
          >
            <LogOut size={15} />Se déconnecter de Haire
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

type Tab = 'salon' | 'roles' | 'account';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'salon', label: 'Salon' },
    { id: 'roles', label: 'Rôles & Permissions' },
    { id: 'account', label: 'Mon Compte' },
  ];
  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === t.id
              ? 'bg-ink text-ivory shadow-soft'
              : 'text-muted hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const [tab, setTab] = useState<Tab>('salon');
  const fetchSalon = useSettingsStore((s) => s.fetchSalon);
  const fetchRoles = useSettingsStore((s) => s.fetchRoles);
  const fetchPermissions = useSettingsStore((s) => s.fetchPermissions);

  useEffect(() => {
    void fetchSalon();
    void fetchRoles();
    void fetchPermissions();
  }, [fetchSalon, fetchRoles, fetchPermissions]);

  return (
    <div className="mx-auto max-w-11xl">
      <TabBar active={tab} onChange={setTab} />
      {tab === 'salon' && <SalonTab />}
      {tab === 'roles' && <RolesTab />}
      {tab === 'account' && <AccountTab />}
    </div>
  );
}
