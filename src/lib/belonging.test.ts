import { describe, expect, it } from 'vitest'
import { REGION_CODES } from '../config/regions'
import { WEEKLY_QUESTION_IDS, weekKey, weeklyQuestion } from '../config/weeklyQuestions'
import { createSeedPosts } from '../data/seed'
import type { PostScope } from '../types'
import {
  RuleError,
  buildPost,
  buildProfile,
  canWriteTo,
  classPostCounts,
  discoverPosts,
  feedPosts,
  promptAnswers,
  regionsIn,
  updateProfile,
} from './rules'

const now = new Date('2026-11-18T10:00:00') // a Wednesday
const me = buildProfile('Alex', 2003, 'JP', now)
const myClass: PostScope = { kind: 'class', generationId: 'gen-z', classYear: 2003 }
const genFeed: PostScope = { kind: 'generation', generationId: 'gen-z' }

describe('weekly question', () => {
  it('is the same all week and changes on Monday', () => {
    const wed = weeklyQuestion(now)
    expect(weeklyQuestion(new Date('2026-11-16T00:01:00'))).toEqual(wed) // Monday
    expect(weeklyQuestion(new Date('2026-11-22T23:59:00'))).toEqual(wed) // Sunday
    expect(weeklyQuestion(new Date('2026-11-23T08:00:00')).id).not.toBe(wed.id)
    expect(wed.week).toBe('2026-11-16')
    expect(weekKey(now)).toBe('2026-11-16')
  })
  it('rotates through every question', () => {
    const ids = new Set<string>()
    for (let w = 0; w < WEEKLY_QUESTION_IDS.length; w++) {
      ids.add(weeklyQuestion(new Date(2026, 0, 5 + w * 7)).id)
    }
    expect(ids.size).toBe(WEEKLY_QUESTION_IDS.length)
  })
})

describe('weekly answers', () => {
  const q = weeklyQuestion(now)
  const prompt = { questionId: q.id, week: q.week }

  it('can answer this week’s question in your class', () => {
    expect(buildPost(me, myClass, 'tea', prompt, now).prompt).toEqual(prompt)
  })
  it('answers only go to your class', () => {
    expect(() => buildPost(me, genFeed, 'tea', prompt, now)).toThrow('promptClassOnly')
  })
  it('rejects a past week or a different question', () => {
    expect(() => buildPost(me, myClass, 'tea', { ...prompt, week: '2020-01-06' }, now)).toThrow('promptExpired')
    const other = WEEKLY_QUESTION_IDS.find((id) => id !== q.id)!
    expect(() => buildPost(me, myClass, 'tea', { questionId: other, week: q.week }, now)).toThrow('promptExpired')
  })
  it('still cannot answer in another class', () => {
    expect(() =>
      buildPost(me, { kind: 'class', generationId: 'gen-z', classYear: 2001 }, 'tea', prompt, now),
    ).toThrow('notYourClass')
  })
  it('finds answers in a feed', () => {
    const posts = [buildPost(me, myClass, 'a', prompt, now), buildPost(me, myClass, 'b', null, now)]
    expect(promptAnswers(posts, prompt).map((p) => p.body)).toEqual(['a'])
  })
})

describe('region (optional, country-level)', () => {
  it('is optional', () => {
    expect(buildProfile('Alex', 2003).region).toBeNull()
  })
  it('only accepts listed country codes', () => {
    expect(() => buildProfile('Alex', 2003, 'Tokyo')).toThrow(RuleError)
    expect(() => buildProfile('Alex', 2003, 'XX')).toThrow('invalidRegion')
  })
  it('is copied onto posts', () => {
    expect(buildPost(me, myClass, 'hi', null, now).authorRegion).toBe('JP')
  })
  it('can be hidden later', () => {
    expect(updateProfile(me, { displayName: 'Alex', bio: '', region: null }).region).toBeNull()
  })
  it('regionsIn lists distinct regions, most common first, ignoring hidden', () => {
    const a = buildPost(me, myClass, '1', null, now)
    const b = { ...a, id: 'b', authorRegion: 'KR' as const }
    const c = { ...a, id: 'c' }
    const d = { ...a, id: 'd', authorRegion: null }
    expect(regionsIn([b, a, c, d])).toEqual(['JP', 'KR'])
  })
})

describe('belonging first: feeds never mix classes', () => {
  const seed = createSeedPosts(now)

  it('my class feed contains only my class', () => {
    const feed = feedPosts(seed, myClass)
    expect(feed.length).toBeGreaterThan(0)
    expect(feed.every((p) => p.scope.kind === 'class' && p.scope.classYear === 2003 && p.scope.generationId === 'gen-z')).toBe(true)
  })
  it('discover excludes my class and generation feeds, includes other generations', () => {
    const found = discoverPosts(seed, me)
    expect(found.some((p) => p.scope.kind === 'class' && p.scope.classYear === 2003)).toBe(false)
    expect(found.every((p) => p.scope.kind === 'class')).toBe(true)
    expect(found.some((p) => p.scope.generationId === 'millennials')).toBe(true)
  })
  it('discover can filter by region', () => {
    const jp = discoverPosts(seed, me, 'JP')
    expect(jp.length).toBeGreaterThan(0)
    expect(jp.every((p) => p.authorRegion === 'JP')).toBe(true)
  })
  it('other generations are readable but not writable', () => {
    expect(canWriteTo(me, { kind: 'class', generationId: 'millennials', classYear: 1995 })).toBe(false)
  })
  it('counts class posts per year', () => {
    const counts = classPostCounts(seed, 'gen-z')
    expect(counts.get(2003)).toBe(feedPosts(seed, myClass).length)
  })
})

describe('sample data', () => {
  const seed = createSeedPosts(now)
  it('is all flagged as demo with valid regions and unique ids', () => {
    expect(seed.every((p) => p.isDemo)).toBe(true)
    expect(seed.every((p) => p.authorRegion === null || (REGION_CODES as readonly string[]).includes(p.authorRegion))).toBe(true)
    expect(new Set(seed.map((p) => p.id)).size).toBe(seed.length)
  })
  it('keeps the original v0.1 ids stable', () => {
    expect(seed[0]!.id).toBe('demo_post_1')
    expect(seed[0]!.authorName).toBe('Maya R.')
    expect(seed[20]!.authorName).toBe('Clara E.')
  })
  it('weekly sample answers use the current question', () => {
    const q = weeklyQuestion(now)
    const answers = seed.filter((p) => p.prompt)
    expect(answers.length).toBeGreaterThan(0)
    expect(answers.every((p) => p.prompt!.questionId === q.id && p.prompt!.week === q.week && p.scope.kind === 'class')).toBe(true)
  })
})
