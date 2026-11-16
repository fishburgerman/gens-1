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
