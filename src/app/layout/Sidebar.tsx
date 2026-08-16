import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';
import { PRIMARY_NAV } from '@/app/nav';
import { useAuthStore } from '@/shared/store/authStore';
import { useNotifStore } from '@/shared/store/notifStore';
import { useLossControlStore } from '@/features/loss-control/lossControlStore';

export function Sidebar() {
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const notifs = useNotifStore((s) => s.items);
  const lossAlerts = useLossControlStore((s) => s.alerts);

  const badgeFor = (to: string): number => {
    // Alertes loss-control : source distincte (LossAlert, pas Notification) — owner-only,
    // peuplée par Shell.tsx au montage, jamais par le socket temps réel générique.
    if (to === '/loss-control') return lossAlerts.length;

    const map: Record<string, string[]> = {
      '/schedule': ['appointment.created', 'appointment.cancelled'],
      '/boutique': ['order.created', 'stock.low'],
      '/orders': ['order.created'],
      '/team': ['leave.requested'],
    };
    const types = map[to] ?? [];
    return notifs.filter((n) => !n.read && types.includes(n.type)).length;
  };

  const navigate = useNavigate();
  const onLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  const showLabel = !collapsed;
  const linkBase = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors';
  const idle = 'text-muted hover:bg-line/50 hover:text-ink';
  const active = 'bg-ink text-ivory';

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col border-r border-line bg-ivory px-3 py-5 transition-all duration-200 md:flex ${
        collapsed ? 'w-[72px]' : 'w-[72px] lg:w-60'
      }`}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-baseline gap-0.5">
            <span className="font-serif text-2xl font-semibold text-ink">H</span>
            <span className={`font-serif text-2xl italic text-ink transition-all ${showLabel ? 'hidden lg:inline' : 'hidden'}`}>
              aire
            </span>
            <span className="font-serif text-2xl text-champagne-deep"> .</span>
          </div>
          <p className={`text-[9px] font-semibold uppercase tracking-[0.2em] text-muted transition-all ${showLabel ? 'hidden lg:block' : 'hidden'}`}>
            {t('app.brandTagline')}
          </p>
        </div>
        <button
          className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-lineStrong hover:text-ink"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </div>

      {/* Navigation label */}
      <div className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted transition-all ${showLabel ? 'hidden lg:block' : 'hidden'}`}>
        {t('nav.navigationLabel')}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {PRIMARY_NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            title={t(n.label)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle} ${showLabel ? 'justify-center lg:justify-start' : 'justify-center'}`
            }
          >
            <Icon name={n.icon} size={18} />
            <span className={showLabel ? 'hidden lg:inline' : 'hidden'}>{t(n.label)}</span>
            {badgeFor(n.to) > 0 && (
              <span className={`h-2 w-2 rounded-full bg-error ${showLabel ? 'ms-auto hidden lg:block' : 'hidden'}`} />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <Link
        to="/"
        title={t('nav.homePage')}
        className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-line/50 hover:text-ink ${showLabel ? 'justify-center lg:justify-start' : 'justify-center'}`}
      >
        <Home size={18} />
        <span className={showLabel ? 'hidden lg:inline' : 'hidden'}>{t('nav.homePage')}</span>
      </Link>

      <button
        onClick={onLogout}
        title={t('nav.logout')}
        className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-line/50 hover:text-ink ${showLabel ? 'justify-center lg:justify-start' : 'justify-center'}`}
      >
        <LogOut size={18} />
        <span className={showLabel ? 'hidden lg:inline' : 'hidden'}>{t('nav.logout')}</span>
      </button>
    </aside>
  );
}
