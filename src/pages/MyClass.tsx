import { Button } from '../components/Button'
import { useComposer } from '../components/Composer'
import { Feed } from '../components/Feed'
import { ComposeButton, PageHeader } from '../components/Layout'
import { Shoreline } from '../components/Sketch'
import { useFormat } from '../i18n/useFormat'
import { feedPosts } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function MyClass() {
  const profile = useProfile()
  const { posts } = useStore()
  const openComposer = useComposer()
  const { t, className, generationShort } = useFormat()
  const items = feedPosts(posts, {
    kind: 'class',
    generationId: profile.generationId,
    classYear: profile.birthYear,
  })
  const members = new Set(items.map((p) => p.authorId)).size
  const name = className(profile.birthYear)

  return (
    <>
      <PageHeader
        eyebrow={t('myClass.eyebrow', { generation: generationShort(profile.generationId) })}
        title={name}
        subtitle={t('myClass.subtitle', { year: profile.birthYear, count: members })}
      />
      <Shoreline className="mb-4 px-5 text-sage" />
      <section className="px-4" aria-label={t('myClass.feedLabel')}>
        <Feed
          posts={items}
          empty={{
            title: t('myClass.emptyTitle'),
            body: t('myClass.emptyBody', { className: name }),
            action: <Button onClick={() => openComposer('class')}>{t('myClass.emptyAction')}</Button>,
          }}
        />
      </section>
      <ComposeButton destination="class" label={t('myClass.compose', { className: name })} />
    </>
  )
}
