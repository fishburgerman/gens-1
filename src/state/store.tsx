import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createSeedPosts } from '../data/seed'
import { buildPost, buildProfile, toggleReaction, updateProfile } from '../lib/rules'
import { DATA_VERSION, clearData, loadData, saveData } from '../lib/storage'
import type { AppData, Post, PostScope, Profile, ReactionType } from '../types'

interface Store {
  profile: Profile | null
  posts: Post[]
  /** false when the browser refused to persist the last change */
  persisted: boolean
  createProfile(displayName: string, birthYear: number): void
  editProfile(changes: { displayName: string; bio: string }): void
  createPost(scope: PostScope, body: string): Post
  react(postId: string, type: ReactionType): void
  resetDemo(): void
}

const StoreContext = createContext<Store | null>(null)

function initialData(): AppData {
  return loadData() ?? { version: DATA_VERSION, profile: null, posts: createSeedPosts() }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData)
  const [persisted, setPersisted] = useState(true)

  useEffect(() => {
    setPersisted(saveData(data))
  }, [data])

  const createProfile = useCallback((displayName: string, birthYear: number) => {
    const profile = buildProfile(displayName, birthYear)
    setData((d) => ({ ...d, profile }))
  }, [])

  const editProfile = useCallback(
    (changes: { displayName: string; bio: string }) => {
      if (!data.profile) return
      const profile = updateProfile(data.profile, changes)
      setData((d) => ({
        ...d,
        profile,
        // keep the author name on your own posts in sync
        posts: d.posts.map((p) =>
          p.authorId === profile.id ? { ...p, authorName: profile.displayName } : p,
        ),
      }))
    },
    [data.profile],
  )

  const createPost = useCallback(
    (scope: PostScope, body: string) => {
      // Validation (membership + content) happens in buildPost and throws RuleError.
      const post = buildPost(data.profile, scope, body)
      setData((d) => ({ ...d, posts: [post, ...d.posts] }))
      return post
    },
    [data.profile],
  )

  const react = useCallback(
    (postId: string, type: ReactionType) => {
      const post = data.posts.find((p) => p.id === postId)
      if (!post) return
      // Throws RuleError when the post is outside the user's feeds.
      const updated = toggleReaction(post, data.profile, type)
      setData((d) => ({ ...d, posts: d.posts.map((p) => (p.id === postId ? updated : p)) }))
    },
    [data.posts, data.profile],
  )

  const resetDemo = useCallback(() => {
    clearData()
    setData({ version: DATA_VERSION, profile: null, posts: createSeedPosts() })
  }, [])

  const value = useMemo<Store>(
    () => ({
      profile: data.profile,
      posts: data.posts,
      persisted,
      createProfile,
      editProfile,
      createPost,
      react,
      resetDemo,
    }),
    [data, persisted, createProfile, editProfile, createPost, react, resetDemo],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/** For screens rendered only after onboarding. */
export function useProfile(): Profile {
  const { profile } = useStore()
  if (!profile) throw new Error('Profile required')
  return profile
}
