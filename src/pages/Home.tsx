import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { Feed } from '../components/Feed'
import { ComposeButton, PageHeader } from '../components/Layout'
import { Logo, Shoreline } from '../components/Sketch'
import { getGeneration } from '../config/generations'
import { useFormat } from '../i18n/useFormat'
import { feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function Home() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const { t, generationShort, generationTagline } = useFormat()
  const generation = getGeneration(profile.generationId)
  const items = feedPosts(posts, { kind: 'generation', generationId: profile.generationId })

  return (
    <>
      <PageHeader
        eyebrow={<Logo className="text-[18px]" />}
        title={generationShort(profile.generationId)}
        subtitle={
          generation &&
          t('home.subtitle', {
            start: generation.startYear,
            end: generation.endYear,
            tagline: generationTagline(generation.id),
          })
        }
      />
      <Shoreline className="mb-4 px-5 text-sand-deep" />
      <section className="px-4" aria-label={t('home.feedLabel')}>
        <Feed
          posts={items}
          empty={{
            title: t('home.emptyTitle'),
            body: t('home.emptyBody'),
            action: <Button onClick={() => openComposer('generation')}>{t('home.emptyAction')}</Button>,
          }}
        />
      </section>
      <ComposeButton destination="generation" label={t('composer.newPost')} />
    </>
  )
}
