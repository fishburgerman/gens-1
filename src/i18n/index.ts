import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'
import { DEFAULT_LANGUAGE, initialLanguage, saveLanguage } from './languages'
import type { Language } from './languages'

export const resources = {
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
} as const

function applyDocumentLanguage(lang: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lang
}

i18n.on('languageChanged', applyDocumentLanguage)

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
})
applyDocumentLanguage(i18n.language)

/** Switches the UI language immediately (no reload) and remembers it on this device. */
export function changeLanguage(lang: Language) {
  saveLanguage(lang)
  void i18n.changeLanguage(lang)
}

export default i18n
