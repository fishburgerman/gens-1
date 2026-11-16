export type RelativeParts =
  | { unit: 'now' }
  | { unit: 'minute' | 'hour' | 'day'; value: number }
  | { unit: 'date'; sameYear: boolean }

/** Language-neutral relative time; the UI turns this into localized text. */
export function relativeParts(iso: string, now: Date = new Date()): RelativeParts {
  const then = new Date(iso)
  const diff = Math.max(0, now.getTime() - then.getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return { unit: 'now' }
  if (min < 60) return { unit: 'minute', value: min }
  const hr = Math.floor(min / 60)
  if (hr < 24) return { unit: 'hour', value: hr }
  const day = Math.floor(hr / 24)
  if (day < 7) return { unit: 'day', value: day }
  return { unit: 'date', sameYear: then.getFullYear() === now.getFullYear() }
}
