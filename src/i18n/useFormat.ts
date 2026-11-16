import { useTranslation } from 'react-i18next'
import { getGeneration } from '../config/generations'
import type { WeeklyQuestionId } from '../config/weeklyQuestions'
import type { GenerationId } from '../config/generations'
import { RuleError } from '../lib/rules'
import { relativeParts } from '../lib/time'

/** Localised labels and formatters shared by many screens. */
export function useFormat() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const className = (year: number) => t('labels.classOf', { year })
  const classShort = (year: number) => t('labels.classShort', { yy: String(year).slice(2) })
  const generationName = (id: string) => {
    const g = getGeneration(id)
    return g ? t(`generations.${g.id}.name`) : id
  }
  const generationShort = (id: string) => {
    const g = getGeneration(id)
    return g ? t(`generations.${g.id}.short`) : id
  }
  const generationTagline = (id: GenerationId) => t(`generations.${id}.tagline`)

  const relativeTime = (iso: string) => {
    const p = relativeParts(iso)
    switch (p.unit) {
      case 'now':
        return t('time.justNow')
      case 'minute':
        return t('time.minutes', { count: p.value })
      case 'hour':
        return t('time.hours', { count: p.value })
      case 'day':
        return t('time.days', { count: p.value })
      case 'date':
        return new Date(iso).toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          ...(p.sameYear ? {} : { year: 'numeric' }),
        })
    }
  }
  const fullTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  /** Country / region names come from the browser (Intl), already localized. */
  const regionName = (code: string) => {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
    } catch {
      return code
    }
  }
  const questionText = (id: WeeklyQuestionId) => t(`weekly.questions.${id}`)

  const errorMessage = (e: unknown) =>
    e instanceof RuleError ? t(`errors.${e.code}`, e.params) : t('errors.generic')

  return {
    t,
    locale,
    className,
    classShort,
    generationName,
    generationShort,
    generationTagline,
    relativeTime,
    fullTime,
    regionName,
    questionText,
    errorMessage,
  }
}
