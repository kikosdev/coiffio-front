import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { isBackoffice, type Role } from '@/shared/auth/types';

interface RequireRoleProps {
  allow: Role[];
  children: ReactNode;
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory">
      <span className="font-serif text-xl italic text-muted">Chargement…</span>
    </div>
  );
}

/** Home par défaut d'un rôle (routage par rôle, SKILL_auth_rbac). */
export function homeForRole(role: Role | undefined): string {
  return isBackoffice(role) ? '/schedule' : '/my-account';
}

/**
 * Garde d'auth + rôle. Attend l'hydratation (loadMe), redirige les non-authentifiés
 * vers /sign-in (en mémorisant `from`), et renvoie un rôle non autorisé vers SON espace.
 */
export function RequireRole({ allow, children }: RequireRoleProps) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') return <FullPageLoader />;

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
