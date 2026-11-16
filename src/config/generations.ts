/**
 * Generation definitions are configuration data, not code.
 * Boundaries differ between sources, so they are kept in one place
 * and can be changed without touching the UI.
 * Display names and taglines live in src/locales/*.json under `generations.<id>`.
 */
export type GenerationId = 'millennials' | 'gen-z' | 'gen-alpha'

export interface GenerationConfig {
  id: GenerationId
  /** Inclusive birth year range */
  startYear: number
  endYear: number
  /** Only enabled generations can be joined during onboarding. */
  enabled: boolean
}

export const GENERATIONS: readonly GenerationConfig[] = [
  {
    id: 'millennials',
    startYear: 1981,
    endYear: 1996,
    enabled: false,
  },
  {
    id: 'gen-z',
    startYear: 1997,
    endYear: 2012,
    enabled: true,
  },
  {
    id: 'gen-alpha',
    startYear: 2013,
    endYear: 2024,
    enabled: false,
  },
]

export function getGeneration(id: string): GenerationConfig | undefined {
  return GENERATIONS.find((g) => g.id === id)
}

export function getGenerationForYear(year: number): GenerationConfig | undefined {
  return GENERATIONS.find((g) => year >= g.startYear && year <= g.endYear)
}

export function enabledGenerations(): GenerationConfig[] {
  return GENERATIONS.filter((g) => g.enabled)
}

/** Birth years that can be selected during onboarding, newest first. */
export function selectableBirthYears(): number[] {
  const years: number[] = []
  for (const g of enabledGenerations()) {
    for (let y = g.endYear; y >= g.startYear; y--) years.push(y)
  }
  return years.sort((a, b) => b - a)
}

/** All class years in a generation, newest first. */
export function classYears(generationId: string): number[] {
  const g = getGeneration(generationId)
  if (!g) return []
  const years: number[] = []
  for (let y = g.endYear; y >= g.startYear; y--) years.push(y)
  return years
}
