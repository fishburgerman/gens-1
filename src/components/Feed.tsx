import type { ReactNode } from 'react'
import type { Post } from '../types'
import { PostCard } from './PostCard'
import { Shoreline } from './Sketch'

export function Feed({
  posts,
  empty,
  showScope,
}: {
  posts: Post[]
  empty: { title: string; body: string; action?: ReactNode }
  showScope?: boolean
}) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <Shoreline className="mb-6 w-24 text-ocean" />
        <h3 className="font-display text-lg">{empty.title}</h3>
        <p className="mt-1.5 max-w-xs text-[15px] text-muted">{empty.body}</p>
        {empty.action && <div className="mt-6">{empty.action}</div>}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} showScope={showScope} />
      ))}
      <div className="flex flex-col items-center py-8 text-[13px] text-muted">
        <Shoreline className="mb-3 w-16 text-sand-deep" />
        You are all caught up.
      </div>
    </div>
  )
}
