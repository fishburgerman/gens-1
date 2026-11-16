import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { Feed } from '../components/Feed'
import { ComposeButton, PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { className as classLabel, getGeneration } from '../config/generations'
import { feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function MyClass() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const generation = getGeneration(profile.generationId)
  const items = feedPosts(posts, {
    kind: 'class',
    generationId: profile.generationId,
    classYear: profile.birthYear,
  })
  const members = new Set(items.map((p) => p.authorId)).size

  return (
    <>
      <PageHeader
        eyebrow={`Your class · ${generation?.shortName ?? ''}`}
        title={classLabel(profile.birthYear)}
        subtitle={`Everyone born in ${profile.birthYear}. ${members} ${members === 1 ? 'voice' : 'voices'} here so far.`}
      />
      <Shoreline className="mb-4 px-5 text-sage" />
      <section className="px-4" aria-label="Class feed">
        <Feed
          posts={items}
          empty={{
            title: 'Your class is just getting started',
            body: `Say hi to the rest of the ${classLabel(profile.birthYear)}.`,
            action: <Button onClick={() => openComposer('class')}>Write to your class</Button>,
          }}
        />
      </section>
      <ComposeButton destination="class" label={`New post in ${classLabel(profile.birthYear)}`} />
    </>
  )
}
