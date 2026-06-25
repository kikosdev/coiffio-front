import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import { AuthLayout } from './AuthLayout';
import { api, ApiError } from '@/shared/api/client';

const requestSchema = z.object({ email: z.string().email('Email invalide') });
const confirmSchema = z.object({ password: z.string().min(6, '6 caractères minimum') });
type RequestValues = z.infer<typeof requestSchema>;
type ConfirmValues = z.infer<typeof confirmSchema>;

/** Mode "request" (pas de token) ou "confirm" (token en query) — endpoints Sprint 1. */
export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <ConfirmForm token={token} /> : <RequestForm />;
}

function RequestForm() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });

  const onSubmit = async (values: RequestValues) => {
    setFormError(null);
    try {
      await api.post('/auth/password-reset/request', values);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Demande impossible.');
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation par email."
      footer={
        <Link to="/sign-in" className="serif-em">
          Retour à la connexion
        </Link>
      }
    >
      {done ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            error={errors.email?.message}
            {...register('email')}
          />
          {formError && <p className="text-sm text-error">{formError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full">
            Envoyer le lien
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

function ConfirmForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmValues>({ resolver: zodResolver(confirmSchema) });

  const onSubmit = async (values: ConfirmValues) => {
    setFormError(null);
    try {
      await api.post('/auth/password-reset/confirm', { token, password: values.password });
      navigate('/sign-in', { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Réinitialisation impossible.');
    }
  };

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError && <p className="text-sm text-error">{formError}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Mettre à jour
        </Button>
      </form>
    </AuthLayout>
  );
}
