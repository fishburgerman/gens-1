/** Pure language helpers (no i18next import) so they are easy to test. */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: Language = 'en'

/** UI language preference is stored separately from app data (it is a device setting). */
export const LANGUAGE_STORAGE_KEY = 'gens:language'

export function isLanguage(v: unknown): v is Language {
  return typeof v === 'string' && LANGUAGES.some((l) => l.code === v)
}

/** Picks the first supported language from the browser's list, e.g. ["ko-KR", "en-US"] -> "ko". */
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }
  return DEFAULT_LANGUAGE
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function storage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function loadLanguage(s: StorageLike | null = storage()): Language | null {
  try {
    const v = s?.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(v) ? v : null
  } catch {
    return null
  }
}

export function saveLanguage(lang: Language, s: StorageLike | null = storage()): void {
  try {
    s?.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch {
    // ignore: language still applies for this session
  }
}

export function initialLanguage(): Language {
  const stored = loadLanguage()
  if (stored) return stored
  const prefs = typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : []
  return detectLanguage(prefs.filter(Boolean))
}
