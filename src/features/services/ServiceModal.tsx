import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useServiceStore, type Service } from './serviceStore';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  category: z.string().max(80).optional(),
  gender: z.enum(['men', 'women', 'universal']),
  price: z.coerce.number().min(0, 'Prix invalide'),
  durationMin: z.coerce.number().int().min(0, 'Durée invalide'),
  bufferMin: z.coerce.number().int().min(0, 'Tampon invalide'),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Couleur hex'),
});
type FormValues = z.infer<typeof schema>;

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}

export function ServiceModal({ open, onClose, service }: ServiceModalProps) {
  const createService = useServiceStore((s) => s.create);
  const updateService = useServiceStore((s) => s.update);
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!service;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: service?.name ?? '',
      category: service?.category ?? '',
      gender: service?.gender ?? 'universal',
      price: service?.price ?? 0,
      durationMin: service?.durationMin ?? 30,
      bufferMin: service?.bufferMin ?? 0,
      color: service?.color ?? '#B89968',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      if (isEdit && service) await updateService(service._id, values);
      else await createService(values);
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
      title={isEdit ? 'Modifier le service' : 'Nouveau service'}
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
        <Input label="Nom du service" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Catégorie" placeholder="Coupe, Couleur…" error={errors.category?.message} {...register('category')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">Genre</label>
            <select
              className="h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
              {...register('gender')}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="universal">Universal</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Prix (TND)" type="number" step="0.5" error={errors.price?.message} {...register('price')} />
          <Input label="Durée (min)" type="number" error={errors.durationMin?.message} {...register('durationMin')} />
          <Input label="Tampon (min)" type="number" error={errors.bufferMin?.message} {...register('bufferMin')} />
        </div>
        <div className="flex items-end gap-3">
          <Input label="Couleur" type="color" className="h-10 w-20 p-1" error={errors.color?.message} {...register('color')} />
          <p className="pb-2 text-xs text-muted">Le tampon (#2) est soustrait au calcul de disponibilité.</p>
        </div>
        {formError && <p className="text-sm text-error">{formError}</p>}
      </form>
    </Modal>
  );
}
