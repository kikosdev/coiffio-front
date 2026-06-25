import { useAuthStore } from '@/shared/store/authStore';
import { EmployeeCaisse } from './EmployeeCaisse';
import { ManagerCaisse } from './ManagerCaisse';

/** La Caisse (Sprint 5) — vue split : stylist → EmployeeCaisse ; owner·manager → ManagerCaisse. */
export function CaisseScreen() {
  const role = useAuthStore((s) => s.user?.role);
  if (role && !['owner', 'manager'].includes(role)) return <EmployeeCaisse />;
  return <ManagerCaisse />;
}
