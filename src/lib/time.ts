export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  const diff = Math.max(0, now.getTime() - then.getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d`
  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(then.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}

export function fullTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
