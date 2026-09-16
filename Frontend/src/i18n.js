import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en.json';
import translationHI from './locales/hi.json';
import translationBN from './locales/bn.json';
import translationTE from './locales/te.json';
import translationMR from './locales/mr.json';
import translationTA from './locales/ta.json';

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  bn: { translation: translationBN },
  te: { translation: translationTE },
  mr: { translation: translationMR },
  ta: { translation: translationTA }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
