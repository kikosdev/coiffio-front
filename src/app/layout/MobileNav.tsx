import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';
import { MOBILE_NAV } from '@/app/nav';

/** Bottom-tab bar fixe, visible uniquement < 768px (contrat responsive SKILL.md). */
export function MobileNav() {
  const { t } = useTranslation('common');
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ivory/95 backdrop-blur md:hidden">
      {MOBILE_NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
              isActive ? 'text-ink' : 'text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={n.icon} size={20} strokeWidth={isActive ? 2.1 : 1.75} />
              <span>{t(n.label)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
