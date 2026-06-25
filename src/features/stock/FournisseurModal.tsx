import { useState } from 'react';
import { Button, Input, Modal } from '@/shared/ui';

export interface Supplier {
  id: number;
  nom: string;
  contact: string;
  tel: string;
  email: string;
  adresse: string;
  notes: string;
}

interface FournisseurModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Supplier, 'id'>) => void;
}

const LSEL = 'flex flex-col gap-1.5';
const LLBL = 'text-xs font-medium uppercase tracking-wide text-muted';

export function FournisseurModal({ open, onClose, onSave }: FournisseurModalProps) {
  const [form, setForm] = useState({ nom: '', contact: '', tel: '', email: '', adresse: '', notes: '' });

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    onSave(form);
    setForm({ nom: '', contact: '', tel: '', email: '', adresse: '', notes: '' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un Fournisseur"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" form="fourn-form">Enregistrer</Button>
        </>
      }
    >
      <form id="fourn-form" onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input label="NOM DE LA SOCIÉTÉ *" required value={form.nom} onChange={upd('nom')} placeholder="L'Oréal Professionnel" />
        <Input label="CONTACT (NOM COMPLET)" value={form.contact} onChange={upd('contact')} placeholder="M. Jean-Paul Mercier" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="TÉLÉPHONE" value={form.tel} onChange={upd('tel')} placeholder="+33 1 00 00 00 00" />
          <Input label="EMAIL" type="email" value={form.email} onChange={upd('email')} placeholder="contact@loreal.fr" />
        </div>
        <Input label="ADRESSE PHYSIQUE" value={form.adresse} onChange={upd('adresse')} placeholder="Paris, France" />
        <div className={LSEL}>
          <label className={LLBL}>NOTES LOGISTIQUES</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={upd('notes')}
            placeholder="Livraison le jeudi. Délai 48h."
            className="w-full resize-none rounded-xl border border-lineStrong bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-champagne focus:ring-2 focus:ring-champagne/30"
          />
        </div>
      </form>
    </Modal>
  );
}
