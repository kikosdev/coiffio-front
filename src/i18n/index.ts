import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/locale.config';

import en from './locales/en';
import fr from './locales/fr';
import ar from './locales/ar';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, fr, ar },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    ns: ['common', 'landing', 'dashboard'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

const applyDir = (lng: string) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};
applyDir(i18n.language);
i18n.on('languageChanged', applyDir);

export default i18n;
