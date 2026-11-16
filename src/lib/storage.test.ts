import { describe, expect, it } from 'vitest'
import { createSeedPosts } from '../data/seed'
import type { AppData } from '../types'
import { DATA_VERSION, STORAGE_KEY, clearData, loadData, parseData, saveData } from './storage'
import type { StorageLike } from './storage'
import { buildProfile } from './rules'

function memory(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  }
}

describe('storage', () => {
  it('round-trips data with a version', () => {
    const s = memory()
    const data: AppData = { version: DATA_VERSION, profile: buildProfile('Alex', 2003), posts: createSeedPosts() }
    expect(saveData(data, s)).toBe(true)
    expect(JSON.parse(s.map.get(STORAGE_KEY)!).version).toBe(DATA_VERSION)
    expect(loadData(s)).toEqual(data)
  })
  it('returns null for missing or corrupt data', () => {
    expect(parseData(null)).toBeNull()
    expect(parseData('{not json')).toBeNull()
    expect(parseData('42')).toBeNull()
  })
  it('rejects data from a newer, unknown version', () => {
    expect(parseData(JSON.stringify({ version: DATA_VERSION + 1, profile: null, posts: [] }))).toBeNull()
  })
  it('drops malformed posts and profiles', () => {
    const raw = JSON.stringify({ version: DATA_VERSION, profile: { id: 1 }, posts: [{ id: 'x' }, ...createSeedPosts()] })
    const parsed = parseData(raw)!
    expect(parsed.profile).toBeNull()
    expect(parsed.posts.length).toBe(createSeedPosts().length)
  })
  it('reports failure when storage throws', () => {
    const s: StorageLike = {
      getItem: () => null,
      setItem: () => { throw new Error('quota') },
      removeItem: () => {},
    }
    expect(saveData({ version: DATA_VERSION, profile: null, posts: [] }, s)).toBe(false)
  })
  it('clears data', () => {
    const s = memory()
    saveData({ version: DATA_VERSION, profile: null, posts: [] }, s)
    clearData(s)
    expect(loadData(s)).toBeNull()
  })
})

describe('migration v1 -> v2', () => {
  const v1Profile = { id: 'user_old', displayName: 'Old', birthYear: 2001, generationId: 'gen-z', bio: 'hi', createdAt: '2026-01-01T00:00:00.000Z' }
  const v1UserPost = {
    id: 'post_old', authorId: 'user_old', authorName: 'Old', authorClassYear: 2001,
    scope: { kind: 'class', generationId: 'gen-z', classYear: 2001 }, body: 'my post',
    createdAt: '2026-01-02T00:00:00.000Z', reactions: { same: [], warm: [], thoughtful: [] }, isDemo: false,
  }
  const v1Demo = {
    id: 'demo_post_1', authorId: 'demo_author_mayar', authorName: 'Maya R.', authorClassYear: 2001,
    scope: { kind: 'generation', generationId: 'gen-z' }, body: 'old sample',
    createdAt: '2026-01-02T00:00:00.000Z', reactions: { same: ['user_old'], warm: [], thoughtful: [] }, isDemo: true,
  }
  const raw = JSON.stringify({ version: 1, profile: v1Profile, posts: [v1UserPost, v1Demo] })

  it('keeps the profile and adds an empty region', () => {
    const data = parseData(raw)!
    expect(data.version).toBe(DATA_VERSION)
    expect(data.profile).toEqual({ ...v1Profile, region: null })
  })
  it('keeps user posts unchanged apart from the new empty fields', () => {
    const data = parseData(raw)!
    expect(data.posts.find((p) => p.id === 'post_old')).toEqual({ ...v1UserPost, authorRegion: null, prompt: null })
  })
  it('refreshes sample posts and keeps the user’s reactions on them', () => {
    const data = parseData(raw)!
    const demo = data.posts.filter((p) => p.isDemo)
    expect(demo.length).toBe(createSeedPosts().length)
    const maya = demo.find((p) => p.id === 'demo_post_1')!
    expect(maya.reactions.same).toContain('user_old')
    expect(maya.authorRegion).not.toBeUndefined()
  })
  it('works without a profile', () => {
    const data = parseData(JSON.stringify({ version: 1, profile: null, posts: [v1Demo] }))!
    expect(data.profile).toBeNull()
    expect(data.posts.every((p) => p.isDemo)).toBe(true)
  })
})

