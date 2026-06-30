import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type AppLocale } from '@/config/locale.config';

const NATIVE_LABEL: Record<AppLocale, string> = { en: 'EN', fr: 'FR', ar: 'AR' };

interface LanguageSwitcherProps {
  className?: string;
  /** 'pill' = dashboard topbar segmented control · 'inline' = landing nav text links */
  variant?: 'pill' | 'inline';
}

export function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.split('-')[0] ?? 'fr') as AppLocale;

  const setLang = (lng: AppLocale) => {
    if (lng !== current) void i18n.changeLanguage(lng);
  };

  if (variant === 'inline') {
    return (
      <div
        className={`tn-locale flex items-center gap-1.5 ${className}`}
        role="group"
        aria-label={t('language.label', { defaultValue: 'Language' })}
      >
        {SUPPORTED_LOCALES.map((lng, i) => (
          <span key={lng} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">·</span>}
            <button
              type="button"
              onClick={() => setLang(lng)}
              aria-current={current === lng}
              className="transition-colors"
              style={{ color: current === lng ? 'var(--ink)' : 'inherit', fontWeight: current === lng ? 600 : 500 }}
            >
              {NATIVE_LABEL[lng]}
            </button>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 ${className}`}
      role="group"
      aria-label={t('language.label', { defaultValue: 'Language' })}
    >
      {SUPPORTED_LOCALES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => setLang(lng)}
          aria-current={current === lng}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            current === lng ? 'bg-champagne-deep text-ivory' : 'text-muted hover:text-ink'
          }`}
        >
          {NATIVE_LABEL[lng]}
        </button>
      ))}
    </div>
  );
}
