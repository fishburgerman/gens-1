/**
 * Weekly Question: an optional prompt that helps people start a post.
 * The text lives in src/locales/*.json under `weekly.questions.<id>`.
 * One question per week, rotating in this order. Everyone sees the same one.
 */
export const WEEKLY_QUESTION_IDS = [
  'ordinaryDay',
  'smallJoy',
  'childhoodSound',
  'lately',
  'view',
  'comfortFood',
  'askClass',
  'routine',
] as const

export type WeeklyQuestionId = (typeof WEEKLY_QUESTION_IDS)[number]

export interface WeeklyQuestion {
  id: WeeklyQuestionId
  /** Monday of the week, local time, e.g. "2026-11-16" */
  week: string
}

const DAY = 86_400_000
/** A Monday used as the rotation anchor. */
const ANCHOR = Date.UTC(2024, 0, 1)

function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const offset = (d.getUTCDay() + 6) % 7 // Monday = 0
  return new Date(d.getTime() - offset * DAY)
}

export function weekKey(date: Date = new Date()): string {
  return mondayOf(date).toISOString().slice(0, 10)
}

export function weeklyQuestion(date: Date = new Date()): WeeklyQuestion {
  const monday = mondayOf(date)
  const weeks = Math.floor((monday.getTime() - ANCHOR) / (7 * DAY))
  const n = WEEKLY_QUESTION_IDS.length
  const id = WEEKLY_QUESTION_IDS[((weeks % n) + n) % n]!
  return { id, week: weekKey(date) }
}

export function isWeeklyQuestionId(v: unknown): v is WeeklyQuestionId {
  return typeof v === 'string' && (WEEKLY_QUESTION_IDS as readonly string[]).includes(v)
}
