import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { CoastScene, Logo } from '../components/Sketch'
import { className as classLabel, getGenerationForYear, selectableBirthYears } from '../config/generations'
import { MAX_NAME_LENGTH, RuleError } from '../lib/rules'
import { useStore } from '../state/store'

export function Welcome() {
  const { createProfile } = useStore()
  const navigate = useNavigate()
  const years = useMemo(() => selectableBirthYears(), [])
  const [name, setName] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const generation = year ? getGenerationForYear(year) : undefined
  const ready = name.trim().length > 0 && year !== null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!year) return
    try {
      createProfile(name, year)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof RuleError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pt-safe pb-safe">
      <div className="pt-10">
        <Logo className="text-[40px]" />
        <CoastScene className="mt-6 w-full" />
        <h1 className="mt-6 font-display text-[30px] leading-[1.15] tracking-tight">
          A calm place for the people who grew up when you did.
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Join your generation, find your class, and see how other years see the world.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-1 flex-col gap-5 pb-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-[14px] font-medium">Display name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            placeholder="How should others see you?"
            className="h-12 w-full rounded-2xl border border-line bg-surface px-4 placeholder:text-muted/70 focus:border-ocean focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="year" className="mb-2 block text-[14px] font-medium">Birth year</label>
          <div className="relative">
            <select
              id="year"
              value={year ?? ''}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
              className={`h-12 w-full appearance-none rounded-2xl border border-line bg-surface px-4 focus:border-ocean focus:outline-none ${year ? 'text-ink' : 'text-muted/70'}`}
            >
              <option value="">Select your year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </div>
          <p className="mt-2 text-[13px] text-muted">
            gens is open to Gen Z ({years[years.length - 1]}–{years[0]}) for now. Your class can't be changed later.
          </p>
        </div>

        <div className="rounded-card border border-line bg-surface p-4" aria-live="polite">
          {year && generation ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[12px] uppercase tracking-wider text-muted">Generation</div>
                <div className="mt-0.5 font-display text-[19px]">{generation.shortName}</div>
              </div>
              <div className="h-9 w-px bg-line" />
              <div className="text-right">
                <div className="text-[12px] uppercase tracking-wider text-muted">Class</div>
                <div className="mt-0.5 font-display text-[19px]">{classLabel(year)}</div>
              </div>
            </div>
          ) : (
            <p className="text-center text-[14px] text-muted">Pick your birth year to see where you belong.</p>
          )}
        </div>

        {error && <p className="text-[14px] text-clay" role="alert">{error}</p>}

        <div className="mt-auto">
          <Button type="submit" className="w-full" disabled={!ready}>
            Get started
          </Button>
          <p className="mt-3 text-center text-[12px] text-muted">
            Demo version. Your profile and posts stay on this device.
          </p>
        </div>
      </form>
    </div>
  )
}
