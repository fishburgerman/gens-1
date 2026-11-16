import { getGenerationForYear } from '../config/generations'
import type { Post, PostScope, Profile, ReactionType } from '../types'
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

export function buildPost(
  profile: Profile | null,
  scope: PostScope,
  body: string,
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
    scope,
    body: validateBody(body),
    createdAt: now.toISOString(),
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

export function buildProfile(displayName: string, birthYear: number, now: Date = new Date()): Profile {
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
    createdAt: now.toISOString(),
  }
}

/**
 * Editable fields only. Birth year / class / generation are intentionally
 * not editable here: class membership is fixed after onboarding.
 */
export function updateProfile(
  profile: Profile,
  changes: { displayName: string; bio: string },
): Profile {
  return {
    ...profile,
    displayName: validateDisplayName(changes.displayName),
    bio: validateBio(changes.bio),
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
