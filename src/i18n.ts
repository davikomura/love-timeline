// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';
import translationES from './locales/es/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  },
  es: {
    translation: translationES
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;