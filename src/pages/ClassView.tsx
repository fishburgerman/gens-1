import { Link, Navigate, useParams } from 'react-router-dom'
import { Feed } from '../components/Feed'
import { ChevronLeftIcon, EyeIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { classYears } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { canWriteTo, feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

/** Read-only view of another class in the user's generation. */
export function ClassView() {
  const profile = useProfile()
  const { posts } = useStore()
  const { year: param } = useParams()
  const { t, className } = useFormat()
  const year = Number(param)

  if (year === profile.birthYear) return <Navigate to="/class" replace />

  if (!Number.isInteger(year) || !classYears(profile.generationId).includes(year)) {
    return (
      <div className="px-6 pt-safe">
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl">{t('classView.notFoundTitle')}</h1>
          <p className="mt-2 text-muted">{t('classView.notFoundBody')}</p>
          <Link to="/explore" className="mt-6 inline-block text-ocean-deep underline underline-offset-4">{t('classView.backToExplore')}</Link>
        </div>
      </div>
    )
  }

  const scope = { kind: 'class' as const, generationId: profile.generationId, classYear: year }
  const items = feedPosts(posts, scope)
  const name = className(year)
  const writable = canWriteTo(profile, scope) // always false here; kept explicit for clarity

  return (
    <>
      <PageHeader
        leading={
          <Link to="/explore" aria-label={t('classView.backToExplore')} className="-ml-2 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-sand/60">
            <ChevronLeftIcon />
          </Link>
        }
        eyebrow={t('classView.visiting')}
        title={name}
      />
      {!writable && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 text-[14px]">
          <EyeIcon size={20} className="shrink-0 text-muted" />
          <span>
            <span className="font-medium">{t('classView.readOnlyTitle')}</span>{' '}
            <span className="text-muted">{t('classView.readOnlyBody', { className: name })}</span>
          </span>
        </div>
      )}
      <Shoreline className="mb-4 px-5 text-sand-deep" />
      <section className="px-4" aria-label={name}>
        <Feed posts={items} empty={{ title: t('classView.emptyTitle'), body: t('classView.emptyBody', { className: name }) }} />
      </section>
    </>
  )
}
