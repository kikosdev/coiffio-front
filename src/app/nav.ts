import type { IconName } from '@/shared/ui';

export interface NavItem {
  to: string;
  /** Clé i18n (namespace "common"), résolue via t() dans Sidebar/MobileNav/Shell — jamais un libellé littéral. */
  label: string;
  icon: IconName;
  pageTitle?: string;
  subtitle?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/overview', label: 'nav.home', icon: 'LayoutDashboard', pageTitle: 'pageTitles.dashboard', subtitle: 'pageTitles.dashboardSubtitle' },
  { to: '/schedule', label: 'nav.appointments', icon: 'CalendarDays' },
  { to: '/clients', label: 'nav.clients', icon: 'UserRound' },
  { to: '/team', label: 'nav.team', icon: 'Users' },
  { to: '/services', label: 'nav.services', icon: 'Sparkles' },
  { to: '/caisse', label: 'nav.financePos', icon: 'Wallet' },
  { to: '/boutique', label: 'nav.stock', icon: 'Package' },
  { to: '/loss-control', label: 'nav.lossControl', icon: 'ShieldAlert' },
  { to: '/ventes', label: 'nav.sales', icon: 'Receipt' },
  { to: '/orders', label: 'nav.orders', icon: 'ShoppingBag' },
  { to: '/settings', label: 'nav.settings', icon: 'Settings' },
];

export const SECONDARY_NAV: NavItem[] = [];

export const MOBILE_NAV: NavItem[] = [
  { to: '/overview', label: 'nav.home', icon: 'LayoutDashboard' },
  { to: '/schedule', label: 'nav.agenda', icon: 'CalendarDays' },
  { to: '/caisse', label: 'nav.checkout', icon: 'Wallet' },
  { to: '/clients', label: 'nav.clients', icon: 'UserRound' },
  { to: '/settings', label: 'nav.more', icon: 'Settings' },
];

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
