import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Feed } from '../components/Feed'
import { GlobeIcon, SearchIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { PostCard } from '../components/PostCard'
import { Shoreline } from '../components/Sketch'
import { GENERATIONS, classYears, getGeneration, getGenerationForYear } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { classPostCounts, discoverPosts, regionsIn } from '../lib/rules'
import { useProfile, useStore } from '../state/store'
import type { Post } from '../types'

const PAGE = 8

/** Discovery second: other classes, other generations, other places. Read-only. */
export function Explore() {
  const profile = useProfile()
  const { posts } = useStore()
  const { t } = useFormat()

  return (
    <>
      <PageHeader title={t('explore.title')} subtitle={t('explore.subtitle')} />
      <Shoreline className="mb-5 px-5 text-ocean" />
      <YearSearch ownYear={profile.birthYear} />
      <ClassGrid posts={posts} ownYear={profile.birthYear} ownGeneration={profile.generationId} />
      <WorldFeed />
    </>
  )
}

function YearSearch({ ownYear }: { ownYear: number }) {
  const { t } = useFormat()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState<{ key: 'invalid' } | { key: 'notOpen'; year: number } | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = value.trim()
    if (!/^\d{4}$/.test(v)) return setError({ key: 'invalid' })
    const year = Number(v)
    if (!getGenerationForYear(year)) return setError({ key: 'notOpen', year })
    navigate(year === ownYear ? '/' : `/explore/${year}`)
  }

  return (
    <form onSubmit={submit} className="mx-4 mb-6" role="search">
      <label htmlFor="year-search" className="mb-2 block px-1 text-[14px] font-medium">{t('explore.searchLabel')}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="year-search"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ''))
              setError(null)
            }}
            placeholder={t('explore.searchPlaceholder')}
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 tabular-nums placeholder:text-muted/70 focus:border-ocean focus:outline-none"
          />
        </div>
        <button type="submit" className="h-12 shrink-0 rounded-full bg-ink px-5 text-[15px] font-medium text-paper active:bg-ink/85">
          {t('explore.searchGo')}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 px-1 text-[13px] text-clay">
          {error.key === 'invalid' ? t('explore.searchInvalid') : t('explore.searchNotOpen', { year: error.year })}
        </p>
      )}
    </form>
  )
}

function ClassGrid({ posts, ownYear, ownGeneration }: { posts: Post[]; ownYear: number; ownGeneration: string }) {
  const { t, generationShort } = useFormat()
  const [genId, setGenId] = useState(ownGeneration)
  const generation = getGeneration(genId)
  const counts = classPostCounts(posts, genId)

  return (
    <section className="mb-8" aria-labelledby="classes-title">
      <h2 id="classes-title" className="mb-3 px-5 font-display text-[19px]">{t('explore.classesTitle')}</h2>
      <div role="tablist" aria-label={t('labels.generation')} className="mx-4 grid grid-cols-3 gap-1 rounded-full bg-sand/70 p-1">
        {GENERATIONS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === genId}
            onClick={() => setGenId(g.id)}
            className={`h-9 truncate rounded-full px-2 text-[13px] font-medium transition-colors ${
              g.id === genId ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(48,58,59,0.08)]' : 'text-muted'
            }`}
          >
            {generationShort(g.id)}
          </button>
        ))}
      </div>
      {generation && !generation.enabled && (
        <p className="mx-5 mt-3 text-[13px] text-muted">{t('explore.closedNote', { generation: generationShort(generation.id) })}</p>
      )}
      <ul className="mx-4 mt-3 grid grid-cols-4 gap-2">
        {classYears(genId).map((year) => {
          const isMine = year === ownYear
          const count = counts.get(year) ?? 0
          return (
            <li key={year}>
              <Link
                to={isMine ? '/' : `/explore/${year}`}
                aria-label={`${t('labels.classOf', { year })}${isMine ? ` · ${t('explore.yourClass')}` : ''}`}
                className={`flex h-[4.5rem] flex-col items-center justify-center rounded-2xl border px-1 text-center active:bg-sand/50 ${
                  isMine ? 'border-sage bg-sage/20' : 'border-line bg-surface'
                }`}
              >
                <span className="font-display text-[19px] tabular-nums leading-none">{year}</span>
                <span className={`mt-1.5 max-w-full truncate text-[11px] ${isMine ? 'font-medium text-sage-deep' : 'text-muted'}`}>
                  {isMine ? t('explore.yourClassShort') : count > 0 ? t('explore.posts', { count }) : '·'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function WorldFeed() {
  const profile = useProfile()
  const { posts } = useStore()
  const { t, regionName } = useFormat()
  const [region, setRegion] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const all = discoverPosts(posts, profile)
  const regions = regionsIn(all)
  const items = discoverPosts(posts, profile, region)

  const chip = (active: boolean) =>
    `h-8 shrink-0 rounded-full border px-3 text-[13px] transition-colors ${
      active ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-muted active:bg-sand/60'
    }`

  return (
    <section aria-labelledby="world-title" className="pb-4">
      <h2 id="world-title" className="flex items-center gap-2 px-5 font-display text-[19px]">
        <GlobeIcon size={20} className="text-ocean-deep" /> {t('explore.worldTitle')}
      </h2>
      <p className="mt-1 px-5 text-[14px] text-muted">{t('explore.worldBody')}</p>
      {regions.length > 0 && (
        <div role="group" aria-label={t('explore.regionFilter')} className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button type="button" aria-pressed={region === null} onClick={() => { setRegion(null); setLimit(PAGE) }} className={chip(region === null)}>
            {t('explore.allRegions')}
          </button>
          {regions.map((r) => (
            <button key={r} type="button" aria-pressed={region === r} onClick={() => { setRegion(r); setLimit(PAGE) }} className={chip(region === r)}>
              {regionName(r)}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 px-4">
        {items.length > limit ? (
          <>
            <div className="flex flex-col gap-3">
              {items.slice(0, limit).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            <div className="flex justify-center py-5">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="h-10 rounded-full border border-line bg-surface px-5 text-[14px] font-medium active:bg-sand/60">
                {t('explore.showMore')}
              </button>
            </div>
          </>
        ) : (
          <Feed posts={items} empty={{ title: t('explore.worldEmptyTitle'), body: t('explore.worldEmptyBody') }} />
        )}
      </div>
    </section>
  )
}

