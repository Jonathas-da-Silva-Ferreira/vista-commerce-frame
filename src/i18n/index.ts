// i18n bootstrap — single source of truth for translations.
// We use i18next + react-i18next because they're framework-agnostic, support
// pluralization/interpolation natively, and integrate with Suspense if needed.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

// Persist key kept in sync with LanguageSwitcher — changing it requires
// migration logic, so we centralize it as a constant.
export const LANGUAGE_STORAGE_KEY = 'nexora:lang';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  // Browser detector falls back to navigator.language when no choice is stored;
  // this gives international visitors a sensible default without UI friction.
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    // Strip regional variants (e.g. "pt" → "pt-BR") so navigator.language="pt"
    // still resolves to a supported locale instead of falling back blindly.
    nonExplicitSupportedLngs: true,
    load: 'currentOnly',
    interpolation: {
      // React already escapes output, so disabling avoids double-escaping
      // entities like apostrophes in translated strings.
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Keep <html lang> in sync with the active language for accessibility and SEO.
// Screen readers and search engines rely on this attribute to pick voices/indexes.
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

export default i18n;
