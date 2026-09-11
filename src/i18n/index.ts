import i18next from 'i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';
import fr from './locales/fr.json';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
  fr: { translation: fr },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    // Bootstrap synchronously and never suspend React on translation load —
    // resources are bundled inline, so deferred/missing keys are not expected.
    initImmediate: false,
    react: { useSuspense: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18next;
