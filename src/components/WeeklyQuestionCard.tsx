import type { WeeklyQuestion } from '../config/weeklyQuestions'
import { useFormat } from '../i18n/useFormat'
import { BubbleIcon } from './Icons'

/** Optional prompt. Never blocks or nags; it is just an easy way in. */
export function WeeklyQuestionCard({
  question,
  answerCount,
  onAnswer,
  onReadAnswers,
}: {
  question: WeeklyQuestion
  answerCount: number
  onAnswer: () => void
  onReadAnswers: () => void
}) {
  const { t, questionText } = useFormat()
  return (
    <section aria-labelledby="weekly-label" className="mx-4 mb-4 rounded-card border border-line bg-surface p-4">
      <div id="weekly-label" className="flex items-center gap-1.5 text-[12.5px] font-medium text-sage-deep">
        <BubbleIcon size={16} /> {t('weekly.label')}
      </div>
      <p className="mt-2 font-display text-[19px] leading-snug">{questionText(question.id)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={onAnswer}
          className="h-9 rounded-full bg-ink px-4 text-[14px] font-medium text-paper active:bg-ink/85"
        >
          {t('weekly.answer')}
        </button>
        {answerCount > 0 && (
          <button type="button" onClick={onReadAnswers} className="h-9 rounded-full px-2 text-[14px] text-ocean-deep underline-offset-4 active:underline">
            {t('weekly.readAnswers', { count: answerCount })}
          </button>
        )}
      </div>
      <p className="mt-2 text-[12.5px] text-muted">{t('weekly.optional')}</p>
    </section>
  )
}
