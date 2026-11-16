import { describe, expect, it } from 'vitest'
import { relativeParts } from './time'

const now = new Date('2026-06-15T12:00:00Z')
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

describe('relativeParts', () => {
  it('buckets durations', () => {
    expect(relativeParts(ago(10_000), now)).toEqual({ unit: 'now' })
    expect(relativeParts(ago(5 * 60_000), now)).toEqual({ unit: 'minute', value: 5 })
    expect(relativeParts(ago(3 * 3_600_000), now)).toEqual({ unit: 'hour', value: 3 })
    expect(relativeParts(ago(2 * 86_400_000), now)).toEqual({ unit: 'day', value: 2 })
    expect(relativeParts(ago(30 * 86_400_000), now)).toEqual({ unit: 'date', sameYear: true })
    expect(relativeParts('2024-01-01T00:00:00Z', now)).toEqual({ unit: 'date', sameYear: false })
  })
})
