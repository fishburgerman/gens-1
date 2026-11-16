import { isRegionCode } from '../config/regions'
import { isWeeklyQuestionId } from '../config/weeklyQuestions'
import { createSeedPosts } from '../data/seed'
import type { AppData, Post, Profile, ReactionType } from '../types'

/**
 * Local-only demo persistence. Nothing here is shared between devices.
 * The shape mirrors what a future API would return (profile + posts),
 * and `version` lets us migrate stored data when the schema changes.
 */
export const STORAGE_KEY = 'gens:data'
export const DATA_VERSION = 2

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>

type Raw = Record<string, unknown>

/**
 * v1 -> v2 (v0.3 "Belonging First"):
 * - profile.region: optional country/region (defaults to null = not shown)
 * - post.authorRegion, post.prompt (default null)
 * - sample posts are refreshed (they gained regions and new entries);
 *   the user's own reactions on them are kept. User posts are untouched.
 */
function migrateV1toV2(data: Raw): Raw {
  const profile: Raw | null = data.profile && typeof data.profile === 'object' ? { region: null, ...(data.profile as Raw) } : null
  const userId = profile && typeof profile.id === 'string' ? profile.id : null
  const oldPosts = Array.isArray(data.posts) ? (data.posts as Raw[]) : []
  const oldDemo = new Map(oldPosts.filter((p) => p && p.isDemo === true).map((p) => [p.id, p]))
  const userPosts = oldPosts
    .filter((p) => p && p.isDemo !== true)
    .map((p) => ({ authorRegion: null, prompt: null, ...p }))
  const seed = createSeedPosts().map((post) => {
    const old = oldDemo.get(post.id) as { reactions?: Partial<Record<ReactionType, unknown>> } | undefined
    if (!userId || !old?.reactions) return post
    const reactions = { ...post.reactions }
    for (const type of Object.keys(reactions) as ReactionType[]) {
      const list = old.reactions[type]
      if (Array.isArray(list) && list.includes(userId)) reactions[type] = [...reactions[type], userId]
    }
    return { ...post, reactions }
  })
  return { ...data, version: 2, profile, posts: [...userPosts, ...seed] }
}

/** migrations[n] upgrades data from version n to n + 1. */
const migrations: Record<number, Migration> = { 1: migrateV1toV2 }

function isProfile(v: unknown): v is Profile {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.displayName === 'string' &&
    typeof p.birthYear === 'number' &&
    typeof p.generationId === 'string' &&
    typeof p.bio === 'string' &&
    (p.region === null || isRegionCode(p.region))
  )
}

function isPrompt(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const p = v as Raw
  return isWeeklyQuestionId(p.questionId) && typeof p.week === 'string'
}

function isPost(v: unknown): v is Post {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  const scope = p.scope as Record<string, unknown> | undefined
  const reactions = p.reactions as Record<string, unknown> | undefined
  return (
    typeof p.id === 'string' &&
    typeof p.authorId === 'string' &&
    typeof p.authorName === 'string' &&
    typeof p.authorClassYear === 'number' &&
    typeof p.body === 'string' &&
    typeof p.createdAt === 'string' &&
    (p.authorRegion === null || isRegionCode(p.authorRegion)) &&
    (p.prompt === null || isPrompt(p.prompt)) &&
    !!scope &&
    (scope.kind === 'generation' || scope.kind === 'class') &&
    typeof scope.generationId === 'string' &&
    (scope.kind !== 'class' || typeof scope.classYear === 'number') &&
    !!reactions &&
    Array.isArray(reactions.same) &&
    Array.isArray(reactions.warm) &&
    Array.isArray(reactions.thoughtful)
  )
}

/** Returns null when nothing usable is stored. */
export function parseData(raw: string | null): AppData | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  let data = parsed as Record<string, unknown>
  let version = typeof data.version === 'number' ? data.version : 0
  if (version > DATA_VERSION) return null
  while (version < DATA_VERSION) {
    const migrate = migrations[version]
    if (!migrate) return null
    data = migrate(data)
    version++
  }
  const profile = isProfile(data.profile) ? data.profile : null
  const posts = Array.isArray(data.posts) ? data.posts.filter(isPost) : []
  return { version: DATA_VERSION, profile, posts }
}

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function loadData(storage: StorageLike | null = defaultStorage()): AppData | null {
  if (!storage) return null
  try {
    return parseData(storage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/** Returns false when the browser refused to save (private mode, quota). */
export function saveData(data: AppData, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: DATA_VERSION }))
    return true
  } catch {
    return false
  }
}

export function clearData(storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
