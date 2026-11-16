import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { Feed } from '../components/Feed'
import { ComposeButton, PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { getGeneration } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

/** The wider, secondary space shared by a whole generation. Never the default screen. */
export function Generation() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const { t, generationShort, generationTagline } = useFormat()
  const generation = getGeneration(profile.generationId)
  const items = feedPosts(posts, { kind: 'generation', generationId: profile.generationId })

  return (
    <>
      <PageHeader
        eyebrow={t('generation.eyebrow')}
        title={generationShort(profile.generationId)}
        subtitle={
          generation &&
          t('generation.subtitle', {
            start: generation.startYear,
            end: generation.endYear,
            tagline: generationTagline(generation.id),
          })
        }
      />
      {generation && (
        <p className="mx-5 -mt-1 mb-4 rounded-2xl bg-sand/60 px-4 py-3 text-[13.5px] text-muted">
          {t('generation.note', { start: generation.startYear, end: generation.endYear })}
        </p>
      )}
      <Shoreline className="mb-4 px-5 text-sand-deep" />
      <section className="px-4" aria-label={t('generation.feedLabel')}>
        <Feed
          posts={items}
          empty={{
            title: t('generation.emptyTitle'),
            body: t('generation.emptyBody'),
            action: <Button onClick={() => openComposer({ destination: 'generation' })}>{t('generation.emptyAction')}</Button>,
          }}
        />
      </section>
      <ComposeButton destination="generation" label={t('composer.newPost')} />
    </>
  )
}
