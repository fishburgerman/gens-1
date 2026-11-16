import { useState } from 'react'
import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { DiscoverCard } from '../components/DiscoverCard'
import { Feed } from '../components/Feed'
import { GlobeIcon } from '../components/Icons'
import { ComposeButton, PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { WeeklyQuestionCard } from '../components/WeeklyQuestionCard'
import { weeklyQuestion } from '../config/weeklyQuestions'
import { useFormat } from '../i18n/useFormat'
import { feedPosts, promptAnswers, regionsIn } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

const MAX_REGION_CHIPS = 4

/**
 * Home = the user's own class. Belonging first:
 * only posts from this class appear here, never posts from other classes.
 */
export function Home() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const { t, className, generationShort, regionName } = useFormat()
  const [answersOnly, setAnswersOnly] = useState(false)

  const name = className(profile.birthYear)
  const classPosts = feedPosts(posts, {
    kind: 'class',
    generationId: profile.generationId,
    classYear: profile.birthYear,
  })
  const weekly = weeklyQuestion()
  const answers = promptAnswers(classPosts, { questionId: weekly.id, week: weekly.week })
  const items = answersOnly ? answers : classPosts
  const regions = regionsIn(classPosts)
  const answer = () => openComposer({ prompt: weekly })

  return (
    <>
      <PageHeader
        eyebrow={t('home.eyebrow', { generation: generationShort(profile.generationId) })}
        title={name}
        subtitle={<span className="font-display text-[17px] text-ink/80">{t('home.tagline')}</span>}
      />

      <div className="mx-5 mb-4">
        <p className="text-[14px] leading-relaxed text-muted">{t('home.belonging', { year: profile.birthYear })}</p>
        {regions.length > 0 && (
          <div className="mt-3 flex items-start gap-2">
            <GlobeIcon size={18} className="mt-0.5 shrink-0 text-ocean-deep" />
            <div className="min-w-0">
              <span className="text-[12px] text-muted">{t('home.regionsLabel')}</span>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {regions.slice(0, MAX_REGION_CHIPS).map((r) => (
                  <li key={r} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[12.5px]">
                    {regionName(r)}
                  </li>
                ))}
                {regions.length > MAX_REGION_CHIPS && (
                  <li className="px-1 py-0.5 text-[12.5px] text-muted">+{regions.length - MAX_REGION_CHIPS}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <Shoreline className="mb-4 px-5 text-sage" />

      <WeeklyQuestionCard
        question={weekly}
        answerCount={answers.length}
        onAnswer={answer}
        onReadAnswers={() => setAnswersOnly(true)}
      />

      {answersOnly && (
        <div className="mx-4 mb-3 rounded-2xl bg-sage/15 px-4 py-2.5 text-[13.5px]">
          <p>{t('home.showingAnswers')}</p>
          <button type="button" onClick={() => setAnswersOnly(false)} className="-ml-1 mt-0.5 h-8 rounded-full px-1 font-medium text-ocean-deep">
            {t('home.showAll')}
          </button>
        </div>
      )}

      <section className="px-4" aria-label={t('home.feedLabel')}>
        <Feed
          posts={items}
          empty={
            answersOnly
              ? { title: t('home.noAnswersTitle'), body: t('home.noAnswersBody'), action: <Button onClick={answer}>{t('weekly.answer')}</Button> }
              : {
                  title: t('home.emptyTitle'),
                  body: t('home.emptyBody', { year: profile.birthYear }),
                  action: <Button onClick={() => openComposer({ destination: 'class' })}>{t('home.emptyAction')}</Button>,
                }
          }
        />
        <div className="pb-4">
          <DiscoverCard />
        </div>
      </section>
      <ComposeButton destination="class" label={t('home.compose', { className: name })} />
    </>
  )
}
