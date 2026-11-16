import { Link, Navigate, useParams } from 'react-router-dom'
import { Feed } from '../components/Feed'
import { ChevronLeftIcon, EyeIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { className as classLabel, classYears } from '../config/generations'
import { canWriteTo, feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

/** Read-only view of another class in the user's generation. */
export function ClassView() {
  const profile = useProfile()
  const { posts } = useStore()
  const { year: param } = useParams()
  const year = Number(param)

  if (year === profile.birthYear) return <Navigate to="/class" replace />

  if (!Number.isInteger(year) || !classYears(profile.generationId).includes(year)) {
    return (
      <div className="px-6 pt-safe">
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl">Class not found</h1>
          <p className="mt-2 text-muted">That class isn't part of your generation.</p>
          <Link to="/explore" className="mt-6 inline-block text-ocean-deep underline underline-offset-4">Back to Explore</Link>
        </div>
      </div>
    )
  }

  const scope = { kind: 'class' as const, generationId: profile.generationId, classYear: year }
  const items = feedPosts(posts, scope)
  const writable = canWriteTo(profile, scope) // always false here; kept explicit for clarity

  return (
    <>
      <PageHeader
        leading={
          <Link to="/explore" aria-label="Back to Explore" className="-ml-2 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-sand/60">
            <ChevronLeftIcon />
          </Link>
        }
        eyebrow="Visiting"
        title={classLabel(year)}
      />
      {!writable && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 text-[14px]">
          <EyeIcon size={20} className="shrink-0 text-muted" />
          <span>
            <span className="font-medium">Read only.</span>{' '}
            <span className="text-muted">Posting and reactions are for the {classLabel(year)}.</span>
          </span>
        </div>
      )}
      <Shoreline className="mb-4 px-5 text-sand-deep" />
      <section className="px-4" aria-label={`${classLabel(year)} feed`}>
        <Feed posts={items} empty={{ title: 'Nothing here yet', body: `The ${classLabel(year)} hasn't posted anything so far.` }} />
      </section>
    </>
  )
}
