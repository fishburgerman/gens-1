import { describe, expect, it } from 'vitest'
import { classYears, getGenerationForYear, selectableBirthYears } from './generations'

describe('generations config', () => {
  it('maps years to generations', () => {
    expect(getGenerationForYear(1997)?.id).toBe('gen-z')
    expect(getGenerationForYear(2012)?.id).toBe('gen-z')
    expect(getGenerationForYear(1996)?.id).toBe('millennials')
  })
  it('only offers enabled generations at onboarding', () => {
    const years = selectableBirthYears()
    expect(years[0]).toBe(2012)
    expect(years[years.length - 1]).toBe(1997)
  })
  it('lists class years newest first', () => {
    expect(classYears('gen-z')).toHaveLength(16)
    expect(classYears('unknown')).toEqual([])
  })
})
