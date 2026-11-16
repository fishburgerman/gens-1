export type ReactionType = 'same' | 'warm' | 'thoughtful'

export const REACTION_TYPES: readonly ReactionType[] = ['same', 'warm', 'thoughtful']

export interface Profile {
  id: string
  displayName: string
  birthYear: number
  generationId: string
  bio: string
  createdAt: string
}

/** Where a post lives. A post belongs to exactly one feed. */
export type PostScope =
  | { kind: 'generation'; generationId: string }
  | { kind: 'class'; generationId: string; classYear: number }

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorClassYear: number
  scope: PostScope
  body: string
  createdAt: string
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
