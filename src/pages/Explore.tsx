import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { className as classLabel, classYears, getGeneration } from '../config/generations'
import { useProfile, useStore } from '../state/store'

export function Explore() {
  const profile = useProfile()
  const { posts } = useStore()
  const generation = getGeneration(profile.generationId)
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
        eyebrow={generation?.name}
        title="Explore classes"
        subtitle="Read how other years see things. You can post only in your own class."
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
                  <span className="block text-[15px] font-medium">{classLabel(year)}</span>
                  <span className="block text-[13px] text-muted">
                    {count === 0 ? 'No posts yet' : `${count} ${count === 1 ? 'post' : 'posts'}`}
                  </span>
                </span>
                {isMine && (
                  <span className="rounded-full bg-sage/25 px-2.5 py-1 text-[12px] font-medium text-sage-deep">Your class</span>
                )}
                <ChevronRightIcon size={18} className="text-muted" />
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="px-6 py-6 text-center text-[13px] text-muted">
        Other generations will open in a future version.
      </p>
    </>
  )
}
