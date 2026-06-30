import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useServiceStore } from '@/features/services/serviceStore';
import { useTeamStore } from '@/features/team/teamStore';
import { useBookingStore } from './bookingStore';

interface WalkinButtonProps {
  onCreated?: () => void;
}

/** Création rapide d'un walk-in (source walkin) — SANS check de dispo (peut chevaucher). */
export function WalkinButton({ onCreated }: WalkinButtonProps) {
  const services = useServiceStore((s) => s.items);
  const staff = useTeamStore((s) => s.staff);
  const walkin = useBookingStore((s) => s.walkin);

  const [open, setOpen] = useState(false);
  const [stylistId, setStylistId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const NON_SERVICE_ROLES = new Set(['owner', 'manager', 'client']);
  const stylists = staff.filter((s) => !NON_SERVICE_ROLES.has(s.role));

  const toggle = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const reset = () => {
    setStylistId('');
    setSelected([]);
    setName('');
    setPhone('');
    setError(null);
  };

  const submit = async () => {
    if (!stylistId || selected.length === 0 || !name || !phone) {
      setError('Stylist, prestation, nom et téléphone requis.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await walkin({ serviceIds: selected, stylistId, clientName: name, clientPhone: phone });
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Walk-in impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="secondary" leftIcon={<Zap size={16} />} onClick={() => setOpen(true)}>
        Walk-in
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Walk-in rapide"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} loading={submitting}>
              Créer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Stylist</label>
            <select
              value={stylistId}
              onChange={(e) => setStylistId(e.target.value)}
              className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
            >
              <option value="">Choisir…</option>
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Prestations</p>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s._id}
                  onClick={() => toggle(s._id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selected.includes(s._id) ? 'border-ink bg-ink text-ivory' : 'border-line text-ink hover:border-champagne'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input placeholder="Nom du client" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      </Modal>
    </>
  );
}
