import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useServiceStore, type Service } from './serviceStore';
import { useStockStore } from '@/features/stock/stockStore';

const doseConfigEntrySchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  doses: z.coerce.number().min(0.01, 'Doses invalides'),
});

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  category: z.string().max(80).optional(),
  gender: z.enum(['men', 'women', 'universal']),
  price: z.coerce.number().min(0, 'Prix invalide'),
  durationMin: z.coerce.number().int().min(0, 'Durée invalide'),
  bufferMin: z.coerce.number().int().min(0, 'Tampon invalide'),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Couleur hex'),
  doseConfig: z.array(doseConfigEntrySchema).superRefine((entries, ctx) => {
    const seen = new Set<string>();
    entries.forEach((entry, index) => {
      if (entry.productId && seen.has(entry.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ce produit est déjà dans la liste',
          path: [index, 'productId'],
        });
      }
      seen.add(entry.productId);
    });
  }),
});
type FormValues = z.infer<typeof schema>;

const SEL =
  'h-10 w-full rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30';

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}

export function ServiceModal({ open, onClose, service }: ServiceModalProps) {
  const createService = useServiceStore((s) => s.create);
  const updateService = useServiceStore((s) => s.update);
  const updateDoseConfig = useServiceStore((s) => s.updateDoseConfig);
  const consumableProducts = useStockStore((s) => s.consumableProducts);
  const fetchConsumableProducts = useStockStore((s) => s.fetchConsumableProducts);
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!service;

  useEffect(() => {
    if (open) void fetchConsumableProducts();
  }, [open, fetchConsumableProducts]);

  const {
    register,
    control,
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
      doseConfig: service?.doseConfig ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'doseConfig' });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const { doseConfig, ...serviceValues } = values;
    try {
      let savedId: string;
      if (isEdit && service) {
        await updateService(service._id, serviceValues);
        savedId = service._id;
      } else {
        const saved = await createService(serviceValues);
        savedId = saved._id;
      }
      // Endpoint séparé — ne touche que le théorique de doses du service.
      if (doseConfig.length > 0 || (isEdit && (service?.doseConfig?.length ?? 0) > 0)) {
        await updateDoseConfig(savedId, doseConfig);
      }
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

        {/* Contrôle des pertes — théorique de doses par produit consommé */}
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-ivory/50 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Produits consommés</p>
            {consumableProducts.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => append({ productId: '', doses: 1 })}
              >
                Ajouter un produit
              </Button>
            )}
          </div>

          {consumableProducts.length === 0 ? (
            <p className="text-xs text-muted">
              Aucun produit consommable configuré — marquez d'abord un produit comme consommable dans Boutique.
            </p>
          ) : fields.length === 0 ? (
            <p className="text-xs text-muted">Ce service ne consomme aucun produit suivi.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <select className={SEL} {...register(`doseConfig.${index}.productId` as const)}>
                      <option value="">Sélectionner un produit…</option>
                      {consumableProducts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.doseConfig?.[index]?.productId && (
                      <p className="mt-1 text-xs text-error">{errors.doseConfig[index]?.productId?.message}</p>
                    )}
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.01"
                      placeholder="Doses"
                      error={errors.doseConfig?.[index]?.doses?.message}
                      {...register(`doseConfig.${index}.doses` as const)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Retirer ce produit"
                    className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {formError && <p className="text-sm text-error">{formError}</p>}
      </form>
    </Modal>
  );
}
