import { describe, expect, it } from 'vitest'
import { createSeedPosts } from '../data/seed'
import type { PostScope } from '../types'
import {
  MAX_POST_LENGTH,
  RuleError,
  buildPost,
  buildProfile,
  canWriteTo,
  feedPosts,
  toggleReaction,
  updateProfile,
} from './rules'

const me = buildProfile('Alex', 2003)
const myClass: PostScope = { kind: 'class', generationId: 'gen-z', classYear: 2003 }
const otherClass: PostScope = { kind: 'class', generationId: 'gen-z', classYear: 2001 }
const genFeed: PostScope = { kind: 'generation', generationId: 'gen-z' }

describe('profile', () => {
  it('assigns generation from birth year', () => {
    expect(me.generationId).toBe('gen-z')
    expect(me.birthYear).toBe(2003)
  })
  it('rejects years outside enabled generations', () => {
    expect(() => buildProfile('Old', 1990)).toThrow(RuleError)
    expect(() => buildProfile('Young', 2018)).toThrow(RuleError)
  })
  it('rejects empty names', () => {
    expect(() => buildProfile('   ', 2003)).toThrow(RuleError)
  })
  it('edit cannot change birth year or class', () => {
    const edited = updateProfile(me, { displayName: 'Alex B', bio: 'hi', region: null, birthYear: 1999 } as never)
    expect(edited.birthYear).toBe(2003)
    expect(edited.displayName).toBe('Alex B')
  })
})

describe('posting rules', () => {
  it('allows posting to own class and own generation', () => {
    expect(canWriteTo(me, myClass)).toBe(true)
    expect(canWriteTo(me, genFeed)).toBe(true)
    expect(buildPost(me, myClass, ' hello ').body).toBe('hello')
  })
  it('blocks posting to another class', () => {
    expect(canWriteTo(me, otherClass)).toBe(false)
    expect(() => buildPost(me, otherClass, 'hello')).toThrow('notYourClass')
  })
  it('blocks posting to another generation', () => {
    expect(() => buildPost(me, { kind: 'generation', generationId: 'millennials' }, 'hi')).toThrow(RuleError)
    expect(() =>
      buildPost(me, { kind: 'class', generationId: 'millennials', classYear: 2003 }, 'hi'),
    ).toThrow(RuleError)
  })
  it('blocks posting without a profile', () => {
    expect(() => buildPost(null, genFeed, 'hi')).toThrow(RuleError)
  })
  it('validates body length', () => {
    expect(() => buildPost(me, genFeed, '   ')).toThrow(RuleError)
    expect(() => buildPost(me, genFeed, 'x'.repeat(MAX_POST_LENGTH + 1))).toThrow(RuleError)
    expect(() => buildPost(me, genFeed, 'x'.repeat(MAX_POST_LENGTH))).not.toThrow()
  })
})

describe('reactions', () => {
  const posts = createSeedPosts()
  const inMyClass = posts.find((p) => p.scope.kind === 'class' && p.scope.classYear === 2003)!
  const inOtherClass = posts.find((p) => p.scope.kind === 'class' && p.scope.classYear === 2001)!

  it('toggles on own class posts', () => {
    const once = toggleReaction(inMyClass, me, 'warm')
    expect(once.reactions.warm).toContain(me.id)
    const twice = toggleReaction(once, me, 'warm')
    expect(twice.reactions.warm).not.toContain(me.id)
  })
  it('is blocked on other class posts', () => {
    expect(() => toggleReaction(inOtherClass, me, 'same')).toThrow(RuleError)
  })
})

describe('feeds', () => {
  it('separates generation and class feeds', () => {
    const posts = createSeedPosts()
    const gen = feedPosts(posts, genFeed)
    const cls = feedPosts(posts, myClass)
    expect(gen.length).toBeGreaterThan(0)
    expect(gen.every((p) => p.scope.kind === 'generation')).toBe(true)
    expect(cls.every((p) => p.scope.kind === 'class' && p.scope.classYear === 2003)).toBe(true)
  })
  it('sorts newest first', () => {
    const feed = feedPosts(createSeedPosts(), genFeed)
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1]!.createdAt >= feed[i]!.createdAt).toBe(true)
    }
  })
  it('demo posts are flagged', () => {
    expect(createSeedPosts().every((p) => p.isDemo)).toBe(true)
  })
})
