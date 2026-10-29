import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bn from './locales/bn.json';
import en from './locales/en.json';

const savedLocale = localStorage.getItem('mms_locale') || 'bn-BD';

i18n.use(initReactI18next).init({
  resources: {
    'bn-BD': { translation: bn },
    'bn': { translation: bn },
    'en': { translation: en },
  },
  lng: savedLocale,
  fallbackLng: 'bn-BD',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
