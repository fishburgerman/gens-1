import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { classYears } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { useProfile, useStore } from '../state/store'

export function Explore() {
  const profile = useProfile()
  const { posts } = useStore()
  const { t, className, generationName } = useFormat()
  const years = classYears(profile.generationId)

  const counts = new Map<number, number>()
  for (const p of posts) {
    if (p.scope.kind === 'class' && p.scope.generationId === profile.generationId) {
      counts.set(p.scope.classYear, (counts.get(p.scope.classYear) ?? 0) + 1)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={generationName(profile.generationId)}
        title={t('explore.title')}
        subtitle={t('explore.subtitle')}
      />
      <Shoreline className="mb-4 px-5 text-ocean" />
      <ul className="mx-4 overflow-hidden rounded-card border border-line bg-surface">
        {years.map((year, i) => {
          const isMine = year === profile.birthYear
          const count = counts.get(year) ?? 0
          return (
            <li key={year} className={i > 0 ? 'border-t border-line' : ''}>
              <Link
                to={isMine ? '/class' : `/explore/${year}`}
                className="flex min-h-16 items-center gap-4 px-4 py-3 active:bg-sand/50"
              >
                <span className="font-display w-14 text-[22px] tabular-nums text-ink/90">{String(year).slice(2)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{className(year)}</span>
                  <span className="block text-[13px] text-muted">
                    {count === 0 ? t('explore.noPosts') : t('explore.posts', { count })}
                  </span>
                </span>
                {isMine && (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-sage/25 px-2.5 py-1 text-[12px] font-medium text-sage-deep">{t('explore.yourClass')}</span>
                )}
                <ChevronRightIcon size={18} className="shrink-0 text-muted" />
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="px-6 py-6 text-center text-[13px] text-muted">
        {t('explore.moreSoon')}
      </p>
    </>
  )
}
