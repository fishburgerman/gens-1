import { useFormat } from '../i18n/useFormat'
import { canReactTo } from '../lib/rules'
import { useStore } from '../state/store'
import type { Post, ReactionType } from '../types'
import { REACTION_TYPES } from '../types'
import { Avatar } from './Avatar'
import { SameIcon, ThoughtfulIcon, WarmIcon } from './Icons'

const REACTION_META: Record<ReactionType, { Icon: typeof SameIcon; active: string }> = {
  same: { Icon: SameIcon, active: 'text-ocean-deep bg-ocean/15' },
  warm: { Icon: WarmIcon, active: 'text-clay bg-clay/10' },
  thoughtful: { Icon: ThoughtfulIcon, active: 'text-sage-deep bg-sage/20' },
}

export function PostCard({ post, showScope = false }: { post: Post; showScope?: boolean }) {
  const { profile, react } = useStore()
  const { t, className, relativeTime, fullTime } = useFormat()
  const interactive = canReactTo(profile, post)
  const isMine = profile?.id === post.authorId

  return (
    <article className="animate-rise rounded-card border border-line bg-surface px-4 pb-3 pt-4">
      <header className="flex items-start gap-3">
        <Avatar name={post.authorName} seed={post.authorId} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-[15px] font-semibold">{post.authorName}</span>
            {isMine && <span className="text-xs text-muted">{t('common.you')}</span>}
            {post.isDemo && (
              <span
                className="rounded-full border border-sand-deep px-1.5 text-[10px] font-medium uppercase tracking-wider text-muted"
                title={t('common.sampleHint')}
              >
                {t('common.sample')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-muted">
            <span>{className(post.authorClassYear)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt} title={fullTime(post.createdAt)}>
              {relativeTime(post.createdAt)}
            </time>
            {showScope && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.scope.kind === 'generation' ? t('post.scopeGeneration') : t('post.scopeClass')}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* User content: shown as written, never translated. dir="auto" keeps mixed scripts tidy. */}
      <p dir="auto" className="post-body mt-3 whitespace-pre-wrap break-words text-[15.5px] leading-relaxed">{post.body}</p>

      <div className="-ml-2 mt-2 flex items-center gap-1" role="group" aria-label={t('post.reactions')}>
        {REACTION_TYPES.map((type) => {
          const { Icon, active } = REACTION_META[type]
          const label = t(`reactions.${type}`)
          const count = post.reactions[type].length
          const mine = !!profile && post.reactions[type].includes(profile.id)
          return (
            <button
              key={type}
              type="button"
              disabled={!interactive}
              aria-pressed={mine}
              aria-label={count ? t('post.withCount', { label, count }) : label}
              title={interactive ? label : t('post.readOnly', { label })}
              onClick={() => react(post.id, type)}
              className={`flex h-9 min-w-11 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors disabled:cursor-default ${
                mine ? active : 'text-muted enabled:active:bg-sand/60'
              }`}
            >
              <Icon size={18} />
              {count > 0 && <span className="tabular-nums">{count}</span>}
            </button>
          )
        })}
      </div>
    </article>
  )
}
