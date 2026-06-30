import { useAuthStore } from '@/shared/store/authStore';
import { ManagerView } from './ManagerView';
import { EmployeeView } from './EmployeeView';

/**
 * Team (Sprint 3) — vue double calquée sur le design staff. Le rôle décide :
 * owner·manager → ManagerView (roster + rota + file d'approbation) ;
 * stylist → EmployeeView « Your standing » (ses chiffres propres, #9).
 */
export function TeamScreen() {
  const role = useAuthStore((s) => s.user?.role);
  if (role && !['owner', 'manager'].includes(role)) return <EmployeeView />;
  return <ManagerView isOwner={role === 'owner'} />;
}
