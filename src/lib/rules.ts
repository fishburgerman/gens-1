import { getGenerationForYear } from '../config/generations'
import { isRegionCode } from '../config/regions'
import type { RegionCode } from '../config/regions'
import { weeklyQuestion } from '../config/weeklyQuestions'
import type { Post, PostPrompt, PostScope, Profile, ReactionType } from '../types'
import { createId } from './id'

export const MAX_POST_LENGTH = 500
export const MAX_NAME_LENGTH = 32
export const MAX_BIO_LENGTH = 160

/** Error codes map to `errors.<code>` in src/locales/*.json. */
export type RuleErrorCode =
  | 'noProfile'
  | 'emptyPost'
  | 'postTooLong'
  | 'notYourClass'
  | 'notYourGeneration'
  | 'readOnly'
  | 'nameRequired'
  | 'nameTooLong'
  | 'bioTooLong'
  | 'generationClosed'
  | 'invalidRegion'
  | 'promptClassOnly'
  | 'promptExpired'

export class RuleError extends Error {
  readonly code: RuleErrorCode
  readonly params: Record<string, number | string>
  constructor(code: RuleErrorCode, params: Record<string, number | string> = {}) {
    super(code)
    this.name = 'RuleError'
    this.code = code
    this.params = params
  }
}

/**
 * Can this profile write to (and react in) the given feed?
 * - Generation feed: only members of that generation.
 * - Class feed: only members of that exact class (birth year).
 */
export function canWriteTo(profile: Profile | null, scope: PostScope): boolean {
  if (!profile) return false
  if (scope.generationId !== profile.generationId) return false
  if (scope.kind === 'class') return scope.classYear === profile.birthYear
  return true
}

export function canReactTo(profile: Profile | null, post: Post): boolean {
  return canWriteTo(profile, post.scope)
}

export function validateBody(body: string): string {
  const trimmed = body.trim()
  if (trimmed.length === 0) throw new RuleError('emptyPost')
  if (trimmed.length > MAX_POST_LENGTH)
    throw new RuleError('postTooLong', { max: MAX_POST_LENGTH })
  return trimmed
}

/** Weekly Question answers go to the author's own class, and only for the current week's question. */
export function validatePrompt(prompt: PostPrompt | null, scope: PostScope, now: Date): PostPrompt | null {
  if (!prompt) return null
  if (scope.kind !== 'class') throw new RuleError('promptClassOnly')
  const current = weeklyQuestion(now)
  if (prompt.questionId !== current.id || prompt.week !== current.week) throw new RuleError('promptExpired')
  return { questionId: prompt.questionId, week: prompt.week }
}

export function buildPost(
  profile: Profile | null,
  scope: PostScope,
  body: string,
  prompt: PostPrompt | null = null,
  now: Date = new Date(),
): Post {
  if (!profile) throw new RuleError('noProfile')
  if (!canWriteTo(profile, scope)) {
    throw new RuleError(scope.kind === 'class' ? 'notYourClass' : 'notYourGeneration')
  }
  return {
    id: createId('post'),
    authorId: profile.id,
    authorName: profile.displayName,
    authorClassYear: profile.birthYear,
    authorRegion: profile.region,
    scope,
    body: validateBody(body),
    createdAt: now.toISOString(),
    prompt: validatePrompt(prompt, scope, now),
    reactions: { same: [], warm: [], thoughtful: [] },
    isDemo: false,
  }
}

export function toggleReaction(post: Post, profile: Profile | null, type: ReactionType): Post {
  if (!profile) throw new RuleError('noProfile')
  if (!canReactTo(profile, post)) throw new RuleError('readOnly')
  const current = post.reactions[type]
  const next = current.includes(profile.id)
    ? current.filter((id) => id !== profile.id)
    : [...current, profile.id]
  return { ...post, reactions: { ...post.reactions, [type]: next } }
}

export function validateDisplayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) throw new RuleError('nameRequired')
  if (trimmed.length > MAX_NAME_LENGTH)
    throw new RuleError('nameTooLong', { max: MAX_NAME_LENGTH })
  return trimmed
}

export function validateBio(bio: string): string {
  const trimmed = bio.trim()
  if (trimmed.length > MAX_BIO_LENGTH)
    throw new RuleError('bioTooLong', { max: MAX_BIO_LENGTH })
  return trimmed
}

export function validateRegion(region: string | null): RegionCode | null {
  if (region === null || region === '') return null
  if (!isRegionCode(region)) throw new RuleError('invalidRegion')
  return region
}

export function buildProfile(
  displayName: string,
  birthYear: number,
  region: string | null = null,
  now: Date = new Date(),
): Profile {
  const generation = getGenerationForYear(birthYear)
  if (!generation || !generation.enabled) {
    throw new RuleError('generationClosed')
  }
  return {
    id: createId('user'),
    displayName: validateDisplayName(displayName),
    birthYear,
    generationId: generation.id,
    bio: '',
    region: validateRegion(region),
    createdAt: now.toISOString(),
  }
}

/**
 * Editable fields only. Birth year / class / generation are intentionally
 * not editable here: class membership is fixed after onboarding.
 */
export function updateProfile(
  profile: Profile,
  changes: { displayName: string; bio: string; region: string | null },
): Profile {
  return {
    ...profile,
    displayName: validateDisplayName(changes.displayName),
    bio: validateBio(changes.bio),
    region: validateRegion(changes.region),
  }
}

export function feedPosts(posts: Post[], scope: PostScope): Post[] {
  return posts
    .filter((p) => {
      if (p.scope.generationId !== scope.generationId) return false
      if (scope.kind === 'generation') return p.scope.kind === 'generation'
      return p.scope.kind === 'class' && p.scope.classYear === scope.classYear
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function isOwnClass(post: Post, profile: Profile): boolean {
  return (
    post.scope.kind === 'class' &&
    post.scope.generationId === profile.generationId &&
    post.scope.classYear === profile.birthYear
  )
}

/**
 * Explore's "around the world" feed: class posts from every class except the user's own.
 * Never used to fill the user's own class feed.
 */
export function discoverPosts(posts: Post[], profile: Profile, region: string | null = null): Post[] {
  return posts
    .filter((p) => p.scope.kind === 'class' && !isOwnClass(p, profile))
    .filter((p) => region === null || p.authorRegion === region)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Distinct regions in a list of posts, most frequent first. Posts without a region are ignored. */
export function regionsIn(posts: Post[]): RegionCode[] {
  const counts = new Map<RegionCode, number>()
  for (const p of posts) if (p.authorRegion) counts.set(p.authorRegion, (counts.get(p.authorRegion) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([r]) => r)
}

/** Answers to a given week's question within a feed. */
export function promptAnswers(posts: Post[], prompt: PostPrompt): Post[] {
  return posts.filter((p) => p.prompt?.questionId === prompt.questionId && p.prompt.week === prompt.week)
}

/** Count of class posts per year for one generation (used by Explore). */
export function classPostCounts(posts: Post[], generationId: string): Map<number, number> {
  const counts = new Map<number, number>()
  for (const p of posts) {
    if (p.scope.kind === 'class' && p.scope.generationId === generationId) {
      counts.set(p.scope.classYear, (counts.get(p.scope.classYear) ?? 0) + 1)
    }
  }
  return counts
}
