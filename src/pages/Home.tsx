import { ComposeButton, PageHeader } from '../components/Layout'
import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { Feed } from '../components/Feed'
import { Logo, Shoreline } from '../components/Sketch'
import { getGeneration } from '../config/generations'
import { feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function Home() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const generation = getGeneration(profile.generationId)
  const items = feedPosts(posts, { kind: 'generation', generationId: profile.generationId })

  return (
    <>
      <PageHeader
        eyebrow={<Logo className="text-[18px]" />}
        title={generation?.shortName ?? 'Your generation'}
        subtitle={`${generation?.startYear}–${generation?.endYear} · ${generation?.tagline ?? ''}`}
      />
      <Shoreline className="mb-4 px-5 text-sand-deep" />
      <section className="px-4" aria-label="Generation feed">
        <Feed
          posts={items}
          empty={{
            title: 'Quiet for now',
            body: 'Be the first to say hello to your generation.',
            action: <Button onClick={() => openComposer('generation')}>Write a post</Button>,
          }}
        />
      </section>
      <ComposeButton destination="generation" label="New post" />
    </>
  )
}
