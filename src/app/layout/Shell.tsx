import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Topbar } from './Topbar';
import { ALL_NAV } from '@/app/nav';
import { useAuthStore } from '@/shared/store/authStore';
import { useNotifStore } from '@/shared/store/notifStore';
import { AppointmentDetailsModal } from '@/features/schedule/AppointmentDetailsModal';

/** Assemble Sidebar (desktop) + Topbar + MobileNav (mobile) + <Outlet/>. */
export function Shell() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const current = ALL_NAV.find((n) => pathname.startsWith(n.to));
  const title = current ? t(current.pageTitle ?? current.label) : 'Salon Haire';
  const subtitle = current?.subtitle ? t(current.subtitle) : undefined;

  // Au montage du backoffice : connexion socket (rooms jointes côté serveur) + notifications.
  const token = useAuthStore((s) => s.token);
  const initNotifs = useNotifStore((s) => s.init);
  const teardown = useNotifStore((s) => s.teardown);
  useEffect(() => {
    if (token) initNotifs(token);
    return () => teardown();
  }, [token, initNotifs, teardown]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5 md:px-6 md:pb-6">
          <Outlet />
        </main>
        <MobileNav />
      </div>
      <AppointmentDetailsModal />
    </div>
  );
}
