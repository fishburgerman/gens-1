import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { className as classLabel, getGeneration } from '../config/generations'
import { MAX_POST_LENGTH, RuleError } from '../lib/rules'
import { useStore } from '../state/store'
import type { PostScope } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { ChevronLeftIcon, CloseIcon } from './Icons'
import { Sheet } from './Sheet'
import { useToast } from './Toast'

export type Destination = 'class' | 'generation'

const ComposerContext = createContext<(dest?: Destination) => void>(() => {})

export function useComposer() {
  return useContext(ComposerContext)
}

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [initial, setInitial] = useState<Destination>('generation')
  const openComposer = useCallback((dest: Destination = 'generation') => {
    setInitial(dest)
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])
  return (
    <ComposerContext.Provider value={openComposer}>
      {children}
      <Sheet open={open} onClose={close} label="New post">
        {open && <ComposerBody initial={initial} onDone={close} />}
      </Sheet>
    </ComposerContext.Provider>
  )
}

function ComposerBody({ initial, onDone }: { initial: Destination; onDone: () => void }) {
  const { profile, createPost } = useStore()
  const toast = useToast()
  const [dest, setDest] = useState<Destination>(initial)
  const [body, setBody] = useState('')
  const [step, setStep] = useState<'write' | 'review'>('write')
  const [error, setError] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (step === 'write') textRef.current?.focus()
  }, [step])

  if (!profile) return null
  const generation = getGeneration(profile.generationId)
  const destLabel = dest === 'class' ? classLabel(profile.birthYear) : (generation?.shortName ?? 'Generation')
  const scope: PostScope =
    dest === 'class'
      ? { kind: 'class', generationId: profile.generationId, classYear: profile.birthYear }
      : { kind: 'generation', generationId: profile.generationId }
  const length = body.trim().length
  const over = length > MAX_POST_LENGTH

  const submit = () => {
    try {
      createPost(scope, body)
      toast(`Posted to ${destLabel}`)
      onDone()
    } catch (e) {
      setError(e instanceof RuleError ? e.message : 'Something went wrong. Please try again.')
      setStep('write')
    }
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between px-3 pt-1">
        {step === 'review' ? (
          <button type="button" onClick={() => setStep('write')} className="flex h-11 items-center gap-1 rounded-full px-2 text-[15px] text-muted">
            <ChevronLeftIcon size={20} /> Edit
          </button>
        ) : (
          <button type="button" onClick={onDone} aria-label="Cancel" className="flex h-11 w-11 items-center justify-center rounded-full text-muted active:bg-sand/60">
            <CloseIcon />
          </button>
        )}
        <h2 className="font-display text-[17px]">{step === 'write' ? 'New post' : 'Review'}</h2>
        {step === 'write' ? (
          <button
            type="button"
            disabled={length === 0 || over}
            onClick={() => setStep('review')}
            className="h-9 rounded-full bg-ink px-4 text-[14px] font-medium text-paper disabled:bg-ink/20"
          >
            Review
          </button>
        ) : (
          <button type="button" onClick={submit} className="h-9 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
            Post
          </button>
        )}
      </div>

      {step === 'write' ? (
        <div className="flex min-h-0 flex-col overflow-y-auto px-5 pb-4">
          <fieldset className="mt-2">
            <legend className="mb-2 text-[13px] text-muted">Post to</legend>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-sand/70 p-1">
              {(['class', 'generation'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={dest === d}
                  onClick={() => setDest(d)}
                  className={`h-10 rounded-full text-[14px] font-medium transition-colors ${
                    dest === d ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(48,58,59,0.08)]' : 'text-muted'
                  }`}
                >
                  {d === 'class' ? classLabel(profile.birthYear) : (generation?.shortName ?? 'Generation')}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {dest === 'class'
                ? `Only your class can post here. Everyone in ${generation?.shortName ?? 'your generation'} can read it.`
                : `Shared with all of ${generation?.shortName ?? 'your generation'}.`}
            </p>
          </fieldset>

          <label className="sr-only" htmlFor="post-body">Post</label>
          <textarea
            id="post-body"
            ref={textRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setError(null)
            }}
            rows={5}
            placeholder="What's on your mind?"
            className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-line bg-surface p-4 leading-relaxed placeholder:text-muted/70 focus:border-ocean focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <span className="text-clay" role="alert">{error}</span>
            <span className={`tabular-nums ${over ? 'text-clay' : 'text-muted'}`}>
              {length}/{MAX_POST_LENGTH}
            </span>
          </div>
        </div>
      ) : (
        <div className="min-h-0 overflow-y-auto px-5 pb-4">
          <p className="mt-2 text-[13px] text-muted">
            Posting to <span className="font-medium text-ink">{destLabel}</span> as{' '}
            <span className="font-medium text-ink">{profile.displayName}</span>
          </p>
          <div className="mt-3 rounded-card border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.displayName} seed={profile.id} size={34} />
              <div>
                <div className="text-[15px] font-semibold">{profile.displayName}</div>
                <div className="text-[13px] text-muted">{classLabel(profile.birthYear)}</div>
              </div>
            </div>
            <p className="mt-3 max-h-[40dvh] overflow-y-auto whitespace-pre-wrap break-words text-[15.5px] leading-relaxed">
              {body.trim()}
            </p>
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Demo: posts are saved on this device only.
          </p>
          <Button className="mt-4 w-full" onClick={submit}>
            Post
          </Button>
        </div>
      )}
    </div>
  )
}
