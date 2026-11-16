import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'

type Tree = { [k: string]: string | Tree }
const PLURAL = /_(zero|one|two|few|many|other)$/

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out[key] = v
    else Object.assign(out, flatten(v, key))
  }
  return out
}

/** Plural variants differ by language (English has _one, ja/ko only _other), so compare base keys. */
function baseKeys(flat: Record<string, string>) {
  return new Set(Object.keys(flat).map((k) => k.replace(PLURAL, '')))
}

function placeholders(s: string) {
  return [...s.matchAll(/\{\{\s*(\w+)/g)].map((m) => m[1]).sort()
}

const locales = { en: flatten(en), ja: flatten(ja), ko: flatten(ko) }

describe('locale files', () => {
  const reference = baseKeys(locales.en)

  for (const [lang, flat] of Object.entries(locales)) {
    it(`${lang}: has exactly the same keys as en`, () => {
      const keys = baseKeys(flat)
      expect([...reference].filter((k) => !keys.has(k)), 'missing').toEqual([])
      expect([...keys].filter((k) => !reference.has(k)), 'extra').toEqual([])
    })

    it(`${lang}: has no empty strings`, () => {
      expect(Object.entries(flat).filter(([, v]) => v.trim() === '').map(([k]) => k)).toEqual([])
    })

    it(`${lang}: every plural key has an _other form`, () => {
      const plurals = Object.keys(flat).filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, ''))
      for (const base of plurals) expect(flat[`${base}_other`], base).toBeDefined()
    })

    it(`${lang}: uses the same {{placeholders}} as en`, () => {
      for (const [key, value] of Object.entries(flat)) {
        const enValue = locales.en[key] ?? locales.en[key.replace(PLURAL, '_other')]
        expect(enValue, key).toBeDefined()
        expect(placeholders(value), key).toEqual(placeholders(enValue!))
      }
    })
  }
})

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return tsxFiles(p)
    return p.endsWith('.tsx') ? [p] : []
  })
}

describe('components', () => {
  it('contain no hard-coded UI text (use t() instead)', () => {
    const offenders: string[] = []
    const src = join(__dirname, '..')
    for (const file of tsxFiles(src)) {
      const code = readFileSync(file, 'utf8')
      // JSX text between tags, e.g. <span>Hello</span>
      for (const m of code.matchAll(/>\s*([A-Za-z][A-Za-z ,.'!?]{2,})\s*</g)) offenders.push(`${file}: ${m[1]}`)
      // user-facing string attributes
      for (const m of code.matchAll(/\b(?:aria-label|placeholder|title|label)="([^"{]*[A-Za-z]{2,}[^"]*)"/g))
        offenders.push(`${file}: ${m[1]}`)
    }
    // "gens" is the brand name and is not translated
    expect(offenders.filter((o) => !o.endsWith(': gens'))).toEqual([])
  })
})
