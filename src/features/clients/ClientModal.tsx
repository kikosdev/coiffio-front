import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useClientStore, type Client } from './clientStore';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(4, 'Téléphone requis'), // clé d'identité (#10)
  email: z.string().email('Email invalide').or(z.literal('')),
  preferredChannel: z.enum(['email', 'sms']),
  commsConsent: z.boolean(),
  notes: z.string().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null; // présent = édition
}

export function ClientModal({ open, onClose, client }: ClientModalProps) {
  const createClient = useClientStore((s) => s.create);
  const updateClient = useClientStore((s) => s.update);
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: client?.name ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      preferredChannel: client?.preferredChannel ?? 'email',
      commsConsent: client?.commsConsent ?? true,
      notes: client?.notes ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      if (isEdit && client) await updateClient(client._id, values);
      else await createClient(values);
      reset();
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Enregistrement impossible.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le client' : 'Nouveau client'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input label="Nom complet" error={errors.name?.message} {...register('name')} />
        <Input label="Téléphone" type="tel" placeholder="+216 ..." error={errors.phone?.message} {...register('phone')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Canal préféré</label>
            <select
              className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              {...register('preferredChannel')}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 accent-[#B89968]" {...register('commsConsent')} />
            Consentement comms
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-lineStrong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
            {...register('notes')}
          />
        </div>
        {formError && <p className="text-sm text-error">{formError}</p>}
      </form>
    </Modal>
  );
}
