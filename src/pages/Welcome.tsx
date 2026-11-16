import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { LanguagePicker } from '../components/LanguagePicker'
import { CoastScene, Logo } from '../components/Sketch'
import { enabledGenerations, getGenerationForYear, selectableBirthYears } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { MAX_NAME_LENGTH } from '../lib/rules'
import { useStore } from '../state/store'

export function Welcome() {
  const { createProfile } = useStore()
  const { t, className, generationShort, errorMessage } = useFormat()
  const navigate = useNavigate()
  const years = useMemo(() => selectableBirthYears(), [])
  const open = enabledGenerations()[0]
  const [name, setName] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const generation = year ? getGenerationForYear(year) : undefined
  const ready = name.trim().length > 0 && year !== null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!year) return
    try {
      createProfile(name, year)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pt-safe pb-safe">
      <div className="flex items-center justify-between gap-4 pt-6">
        <Logo className="text-[40px]" />
        <div className="flex-1" />
        <div className="w-[15.5rem] max-w-[60%]">
          <LanguagePicker size="sm" />
        </div>
      </div>
      <CoastScene className="mt-6 w-full" />
      <h1 className="mt-6 font-display text-[30px] leading-[1.2] tracking-tight">{t('welcome.headline')}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{t('welcome.lead')}</p>

      <form onSubmit={submit} className="mt-8 flex flex-1 flex-col gap-5 pb-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-[14px] font-medium">{t('welcome.nameLabel')}</label>
          <input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            placeholder={t('welcome.namePlaceholder')}
            className="h-12 w-full rounded-2xl border border-line bg-surface px-4 placeholder:text-muted/70 focus:border-ocean focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="year" className="mb-2 block text-[14px] font-medium">{t('welcome.yearLabel')}</label>
          <div className="relative">
            <select
              id="year"
              value={year ?? ''}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
              className={`h-12 w-full appearance-none rounded-2xl border border-line bg-surface px-4 focus:border-ocean focus:outline-none ${year ? 'text-ink' : 'text-muted/70'}`}
            >
              <option value="">{t('welcome.yearPlaceholder')}</option>
              {years.map((y) => (
                <option key={y} value={y}>{t('welcome.yearOption', { year: y })}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </div>
          {open && (
            <p className="mt-2 text-[13px] text-muted">
              {t('welcome.yearHelp', { generation: generationShort(open.id), start: open.startYear, end: open.endYear })}
            </p>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4" aria-live="polite">
          {year && generation ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[12px] uppercase tracking-wider text-muted">{t('labels.generation')}</div>
                <div className="mt-0.5 font-display text-[19px]">{generationShort(generation.id)}</div>
              </div>
              <div className="h-9 w-px shrink-0 bg-line" />
              <div className="min-w-0 text-right">
                <div className="text-[12px] uppercase tracking-wider text-muted">{t('labels.class')}</div>
                <div className="mt-0.5 font-display text-[19px]">{className(year)}</div>
              </div>
            </div>
          ) : (
            <p className="text-center text-[14px] text-muted">{t('welcome.pickYear')}</p>
          )}
        </div>

        {error !== null && <p className="text-[14px] text-clay" role="alert">{errorMessage(error)}</p>}

        <div className="mt-auto">
          <Button type="submit" className="w-full" disabled={!ready}>
            {t('welcome.start')}
          </Button>
          <p className="mt-3 text-center text-[12px] text-muted">{t('common.demoDevice')}</p>
        </div>
      </form>
    </div>
  )
}
