import { useMemo } from 'react'
import { REGION_CODES } from '../config/regions'
import { useFormat } from '../i18n/useFormat'

/** Optional, country-level only. The empty option means "don't show". */
export function RegionSelect({ id, value, onChange }: { id: string; value: string | null; onChange: (v: string | null) => void }) {
  const { t, regionName, locale } = useFormat()
  const options = useMemo(
    () =>
      REGION_CODES.map((code) => ({ code, name: regionName(code) })).sort((a, b) =>
        a.name.localeCompare(b.name, locale),
      ),
    [locale],
  )
  return (
    <div className="relative">
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`h-12 w-full appearance-none rounded-2xl border border-line bg-surface px-4 pr-10 focus:border-ocean focus:outline-none ${value ? 'text-ink' : 'text-muted/80'}`}
      >
        <option value="">{t('welcome.regionNone')}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>{o.name}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  )
}
