import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useFinanceStore } from './financeStore';

interface ExpenseModalProps { open: boolean; onClose: () => void; }

export function ExpenseModal({ open, onClose }: ExpenseModalProps) {
  const create = useFinanceStore((s) => s.createExpense);
  const [form, setForm] = useState({ category: '', amount: 0, date: '', note: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.category || form.amount <= 0) { setError('Catégorie et montant requis.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await create({ category: form.category, amount: form.amount, date: form.date || undefined, note: form.note || undefined });
      setForm({ category: '', amount: 0, date: '', note: '' });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle dépense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} loading={submitting}>Enregistrer</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input label="Catégorie" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        <Input label="Montant (TND)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <Input label="Note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </Modal>
  );
}
