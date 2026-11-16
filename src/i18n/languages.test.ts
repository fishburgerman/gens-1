import { describe, expect, it } from 'vitest'
import { LANGUAGE_STORAGE_KEY, detectLanguage, loadLanguage, saveLanguage } from './languages'

describe('language detection', () => {
  it('matches supported languages by base tag', () => {
    expect(detectLanguage(['ja-JP', 'en-US'])).toBe('ja')
    expect(detectLanguage(['ko-KR'])).toBe('ko')
    expect(detectLanguage(['en-GB'])).toBe('en')
  })
  it('skips unsupported languages', () => {
    expect(detectLanguage(['fr-FR', 'ko'])).toBe('ko')
  })
  it('falls back to English', () => {
    expect(detectLanguage(['fr-FR', 'zh-TW'])).toBe('en')
    expect(detectLanguage([])).toBe('en')
  })
})

describe('language storage', () => {
  it('round-trips and ignores invalid values', () => {
    const map = new Map<string, string>()
    const s = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) }
    expect(loadLanguage(s)).toBeNull()
    saveLanguage('ko', s)
    expect(loadLanguage(s)).toBe('ko')
    map.set(LANGUAGE_STORAGE_KEY, 'xx')
    expect(loadLanguage(s)).toBeNull()
  })
})
