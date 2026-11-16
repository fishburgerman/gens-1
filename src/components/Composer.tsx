import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { WeeklyQuestion } from '../config/weeklyQuestions'
import { useFormat } from '../i18n/useFormat'
import { MAX_POST_LENGTH } from '../lib/rules'
import { useStore } from '../state/store'
import type { PostScope } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { BubbleIcon, ChevronLeftIcon, CloseIcon } from './Icons'
import { Sheet } from './Sheet'
import { useToast } from './Toast'

export type Destination = 'class' | 'generation'

export interface ComposerOptions {
  destination?: Destination
  /** Answering the Weekly Question: destination is locked to the user's class. */
  prompt?: WeeklyQuestion
}

const STARTERS = ['today', 'thinking', 'small', 'memory', 'life', 'ask'] as const
type Starter = (typeof STARTERS)[number]

const ComposerContext = createContext<(opts?: ComposerOptions) => void>(() => {})

export function useComposer() {
  return useContext(ComposerContext)
}

export function ComposerProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ComposerOptions>({})
  const openComposer = useCallback((opts: ComposerOptions = {}) => {
    setOptions(opts)
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])
  return (
    <ComposerContext.Provider value={openComposer}>
      {children}
      <Sheet open={open} onClose={close} label={t('composer.title')}>
        {open && <ComposerBody options={options} onDone={close} />}
      </Sheet>
    </ComposerContext.Provider>
  )
}

function ComposerBody({ options, onDone }: { options: ComposerOptions; onDone: () => void }) {
  const { profile, createPost } = useStore()
  const { t, className, generationShort, errorMessage, questionText } = useFormat()
  const toast = useToast()
  const prompt = options.prompt ?? null
  const [dest, setDest] = useState<Destination>(prompt ? 'class' : (options.destination ?? 'class'))
  const [starter, setStarter] = useState<Starter | null>(null)
  const [body, setBody] = useState('')
  const [step, setStep] = useState<'write' | 'review'>('write')
  const [error, setError] = useState<unknown>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (step === 'write') textRef.current?.focus()
  }, [step])

  if (!profile) return null
  const generation = generationShort(profile.generationId)
  const myClass = className(profile.birthYear)
  const destLabel = dest === 'class' ? myClass : generation
  const scope: PostScope =
    dest === 'class'
      ? { kind: 'class', generationId: profile.generationId, classYear: profile.birthYear }
      : { kind: 'generation', generationId: profile.generationId }
  const length = body.trim().length
  const over = length > MAX_POST_LENGTH
  const placeholder = prompt
    ? t('composer.answerPlaceholder')
    : starter
      ? t(`composer.starterPlaceholders.${starter}`, { year: profile.birthYear })
      : t('composer.placeholder')

  const submit = () => {
    try {
      createPost(scope, body, prompt && { questionId: prompt.id, week: prompt.week })
      toast(t('composer.posted', { destination: destLabel }))
      onDone()
    } catch (e) {
      setError(e)
      setStep('write')
    }
  }

  const actionClass = 'h-9 rounded-full bg-ink px-4 text-[14px] font-medium text-paper disabled:bg-ink/20'

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between px-3 pt-1">
        {step === 'review' ? (
          <button type="button" onClick={() => setStep('write')} className="flex h-11 items-center gap-1 rounded-full px-2 text-[15px] text-muted">
            <ChevronLeftIcon size={20} /> {t('composer.edit')}
          </button>
        ) : (
          <button type="button" onClick={onDone} aria-label={t('common.cancel')} className="flex h-11 w-11 items-center justify-center rounded-full text-muted active:bg-sand/60">
            <CloseIcon />
          </button>
        )}
        <h2 className="font-display text-[17px]">
          {step === 'review' ? t('composer.reviewTitle') : prompt ? t('composer.answerTitle') : t('composer.title')}
        </h2>
        {step === 'write' ? (
          <button type="button" disabled={length === 0 || over} onClick={() => setStep('review')} className={actionClass}>
            {t('composer.review')}
          </button>
        ) : (
          <button type="button" onClick={submit} className={actionClass}>
            {t('composer.post')}
          </button>
        )}
      </div>

      {step === 'write' ? (
        <div className="flex min-h-0 flex-col overflow-y-auto px-5 pb-4">
          {prompt ? (
            <div className="mt-2 rounded-2xl bg-sage/15 p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-sage-deep">
                <BubbleIcon size={16} /> {t('weekly.label')}
              </div>
              <p className="mt-1.5 font-display text-[17px] leading-snug">{questionText(prompt.id)}</p>
              <p className="mt-2 text-[13px] text-muted">{t('composer.answerNote', { className: myClass })}</p>
            </div>
          ) : (
            <fieldset className="mt-2">
              <legend className="mb-2 text-[13px] text-muted">{t('composer.postTo')}</legend>
              <div className="grid grid-cols-2 gap-1 rounded-full bg-sand/70 p-1">
                {(['class', 'generation'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={dest === d}
                    onClick={() => setDest(d)}
                    className={`h-10 truncate rounded-full px-2 text-[14px] font-medium transition-colors ${
                      dest === d ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(48,58,59,0.08)]' : 'text-muted'
                    }`}
                  >
                    {d === 'class' ? myClass : generation}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-muted">
                {dest === 'class' ? t('composer.classHint', { generation }) : t('composer.generationHint', { generation })}
              </p>
            </fieldset>
          )}

          <label className="sr-only" htmlFor="post-body">{t('composer.bodyLabel')}</label>
          <textarea
            id="post-body"
            ref={textRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setError(null)
            }}
            rows={5}
            dir="auto"
            placeholder={placeholder}
            className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-line bg-surface p-4 leading-relaxed placeholder:text-muted/70 focus:border-ocean focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-[13px]">
            <span className="text-clay" role="alert">{error !== null ? errorMessage(error) : null}</span>
            <span className={`shrink-0 tabular-nums ${over ? 'text-clay' : 'text-muted'}`}>
              {length}/{MAX_POST_LENGTH}
            </span>
          </div>

          {!prompt && (
            <div className="mt-3">
              <p className="mb-2 text-[13px] text-muted">{t('composer.startersLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={starter === s}
                    onClick={() => {
                      setStarter(starter === s ? null : s)
                      textRef.current?.focus()
                    }}
                    className={`h-9 rounded-full border px-3.5 text-[13px] transition-colors ${
                      starter === s ? 'border-ocean bg-ocean/10 text-ink' : 'border-line bg-surface text-muted active:bg-sand/60'
                    }`}
                  >
                    {t(`composer.starters.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-0 overflow-y-auto px-5 pb-4">
          <p className="mt-2 text-[13px] text-muted">
            <Trans
              i18nKey="composer.postingAs"
              values={{ destination: destLabel, name: profile.displayName }}
              components={{ strong: <span className="font-medium text-ink" /> }}
            />
          </p>
          <div className="mt-3 rounded-card border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.displayName} seed={profile.id} size={34} />
              <div>
                <div className="text-[15px] font-semibold">{profile.displayName}</div>
                <div className="text-[13px] text-muted">{myClass}</div>
              </div>
            </div>
            {prompt && (
              <p className="mt-3 flex items-start gap-1.5 text-[13px] text-sage-deep">
                <BubbleIcon size={16} className="mt-0.5 shrink-0" />
                <span>{questionText(prompt.id)}</span>
              </p>
            )}
            <p dir="auto" className="post-body mt-3 max-h-[40dvh] overflow-y-auto whitespace-pre-wrap break-words text-[15.5px] leading-relaxed">
              {body.trim()}
            </p>
          </div>
          <p className="mt-3 text-[12px] text-muted">{t('composer.deviceNote')}</p>
          <Button className="mt-4 w-full" onClick={submit}>
            {t('composer.post')}
          </Button>
        </div>
      )}
    </div>
  )
}
