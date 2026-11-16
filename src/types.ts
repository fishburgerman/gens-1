import type { RegionCode } from './config/regions'
import type { WeeklyQuestionId } from './config/weeklyQuestions'

export type ReactionType = 'same' | 'warm' | 'thoughtful'

export const REACTION_TYPES: readonly ReactionType[] = ['same', 'warm', 'thoughtful']

export interface Profile {
  id: string
  displayName: string
  birthYear: number
  generationId: string
  bio: string
  /** Optional country / region (ISO alpha-2). null = not shown. Never more precise than a country. */
  region: RegionCode | null
  createdAt: string
}

/** Where a post lives. A post belongs to exactly one feed. */
export type PostScope =
  | { kind: 'generation'; generationId: string }
  | { kind: 'class'; generationId: string; classYear: number }

/** Set when a post answers a Weekly Question. */
export interface PostPrompt {
  questionId: WeeklyQuestionId
  week: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorClassYear: number
  /** Snapshot of the author's optional region; kept in sync when they change it. */
  authorRegion: RegionCode | null
  scope: PostScope
  body: string
  createdAt: string
  prompt: PostPrompt | null
  /** reaction type -> list of profile ids who reacted */
  reactions: Record<ReactionType, string[]>
  /** Sample content shipped with the demo. Never a real user. */
  isDemo: boolean
}

export interface AppData {
  version: number
  profile: Profile | null
  posts: Post[]
}
