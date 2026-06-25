import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';
import { BellMenu } from './BellMenu';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  return (
    <header className="flex items-center gap-4 border-b border-line bg-ivory/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="truncate font-serif text-xl font-medium text-ink md:text-2xl">{title}</h1>
          {subtitle && (
            <span className="hidden text-sm font-normal text-muted md:inline">— {subtitle}</span>
          )}
        </div>
      </div>

      <div className="ms-auto flex items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted lg:flex">
          <Search size={15} className="shrink-0" />
          <input
            className="w-52 bg-transparent text-ink outline-none placeholder:text-muted/70"
            placeholder={t('search.placeholder')}
          />
          <kbd className="ms-1 rounded border border-line bg-ivory px-1.5 py-0.5 text-[10px] font-medium text-muted">
            ⌘K
          </kbd>
        </div>
        <LanguageSwitcher />
        <BellMenu />
        <Avatar name={user?.name ?? 'Salon Haire'} size={36} />
      </div>
    </header>
  );
}
