import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useLeaveStore } from './leaveStore';
import { useTeamStore } from './teamStore';

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  /** Si true, l'auteur peut choisir le membre (owner·manager). Sinon, pour soi-même. */
  canPickMember?: boolean;
}

/** Soumission d'une demande de congé / échange (stylist pour soi ; manager pour un membre). */
export function LeaveRequestModal({ open, onClose, canPickMember = false }: LeaveRequestModalProps) {
  const create = useLeaveStore((s) => s.create);
  const staff = useTeamStore((s) => s.staff);

  const [form, setForm] = useState({ stylistId: '', type: 'leave' as 'leave' | 'swap', from: '', to: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const members = staff.filter((s) => s.role !== 'client');

  const submit = async () => {
    if (!form.from || !form.to) {
      setError('Renseignez la plage de dates.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await create({
        stylistId: canPickMember && form.stylistId ? form.stylistId : undefined,
        type: form.type,
        range: { from: form.from, to: form.to },
        note: form.note || undefined,
      });
      setForm({ stylistId: '', type: 'leave', from: '', to: '', note: '' });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Demande impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle demande"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} loading={submitting}>
            Soumettre
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {canPickMember && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Membre</label>
            <select
              value={form.stylistId}
              onChange={(e) => setForm((f) => ({ ...f, stylistId: e.target.value }))}
              className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
            >
              <option value="">Moi-même</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'leave' | 'swap' }))}
            className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
          >
            <option value="leave">Congé</option>
            <option value="swap">Échange de shift</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Du" type="date" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
          <Input label="Au" type="date" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
        </div>
        <Input
          label="Note (optionnel)"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </Modal>
  );
}
