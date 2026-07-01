import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { ApiError } from '@/shared/api/client';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(4, 'Téléphone requis'), // phone = clé d'identité (#10)
  password: z.string().min(6, '6 caractères minimum'),
});
type FormValues = z.infer<typeof schema>;

export function Register() {
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await registerUser({ name: values.name, identifier: values.email, phone: values.phone, password: values.password });
      // Un nouveau compte est toujours un client → espace My Account.
      navigate('/my-account', { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Inscription impossible.');
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Réservez et suivez vos visites en ligne."
      footer={
        <span>
          Déjà client ?{' '}
          <Link to="/sign-in" className="serif-em">
            Se connecter
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input label="Nom complet" placeholder="Prénom Nom" error={errors.name?.message} {...register('name')} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Téléphone"
          type="tel"
          autoComplete="tel"
          placeholder="+216 ..."
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError && <p className="text-sm text-error">{formError}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
}
