import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell } from './layout/Shell';
import { Placeholder } from '@/features/Placeholder';
import { RequireRole, homeForRole } from './guards/RequireRole';
import { SignIn } from '@/storefront/SignIn';
import { Register } from '@/storefront/Register';
import { ResetPassword } from '@/storefront/ResetPassword';
import { MyAccount } from '@/storefront/MyAccount';
import { BookApp } from '@/storefront/book/BookApp';
import { ClientsList } from '@/features/clients/ClientsList';
import { ServicesScreen } from '@/features/services/ServicesScreen';
import { TeamScreen } from '@/features/team/TeamScreen';
import { ScheduleScreen } from '@/features/schedule/ScheduleScreen';
import { CaisseScreen } from '@/features/finance/CaisseScreen';
import { OverviewScreen } from '@/features/overview/OverviewScreen';
import { StockScreen } from '@/features/stock/StockScreen';
import { LossControlScreen } from '@/features/loss-control/LossControlScreen';
import { OrdersQueue } from '@/features/orders/OrdersQueue';
import { VentesPage } from '@/features/ventes/VentesPage';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { ShopLayout } from '@/storefront/shop/ShopLayout';
import { ShopCatalog } from '@/storefront/shop/ShopCatalog';
import { CheckoutPage } from '@/storefront/shop/CheckoutPage';
import { OrderTracking } from '@/storefront/shop/OrderTracking';
import { Landing } from '@/storefront/landing/Landing';
import { useAuthStore } from '@/shared/store/authStore';
import { BACKOFFICE_ROLES } from '@/shared/auth/types';
import type { IconName } from '@/shared/ui';

interface RouteDef {
  path: string;
  title: string;
  icon: IconName;
  sprint: string;
}

// Placeholders restants (remplacés sprint par sprint).
const ROUTES: RouteDef[] = [];

/** Redirige la racine selon l'état d'auth / le rôle. */
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  if (status === 'idle' || status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-ivory font-serif italic text-muted">Chargement…</div>;
  }
  if (!user) return <Navigate to="/sign-in" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

export const router = createBrowserRouter([
  // Public / storefront auth
  { path: '/sign-in', element: <SignIn /> },
  { path: '/register', element: <Register /> },
  { path: '/reset-password', element: <ResetPassword /> },

  // Espace client
  {
    path: '/my-account',
    element: (
      <RequireRole allow={['client']}>
        <MyAccount />
      </RequireRole>
    ),
  },
  // Parcours public "Book a Visit" (invité ou client connecté — merge-on-phone #10).
  { path: '/book', element: <BookApp /> },

  // Boutique publique (storefront) — CartDrawer monté dans ShopLayout.
  {
    element: <ShopLayout />,
    children: [
      { path: '/shop', element: <ShopCatalog /> },
      { path: '/checkout', element: <CheckoutPage /> },
    ],
  },
  { path: '/track/order/:token', element: <OrderTracking /> },

  // Landing publique (sans authentification).
  { path: '/', element: <Landing /> },

  // Backoffice (owner/manager/stylist) sous le Shell
  {
    element: (
      <RequireRole allow={BACKOFFICE_ROLES}>
        <Shell />
      </RequireRole>
    ),
    children: [
      { path: 'overview', element: <OverviewScreen /> },
      { path: 'schedule', element: <ScheduleScreen /> },
      { path: 'caisse', element: <CaisseScreen /> },
      { path: 'boutique', element: <StockScreen /> },
      { path: 'loss-control', element: <LossControlScreen /> },
      { path: 'ventes', element: <VentesPage /> },
      { path: 'orders', element: <OrdersQueue /> },
      { path: 'clients', element: <ClientsList /> },
      { path: 'services', element: <ServicesScreen /> },
      { path: 'team', element: <TeamScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      ...ROUTES.map((r) => ({
        path: r.path,
        element: <Placeholder title={r.title} icon={r.icon} sprint={r.sprint} />,
      })),
    ],
  },

  // Fallback : décide selon l'auth
  { path: '*', element: <RootRedirect /> },
]);
