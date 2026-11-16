/**
 * Optional country / region shown on posts (ISO 3166-1 alpha-2).
 * Only a country-level code is stored. No city, coordinates or IP-based location.
 * Display names are localized at runtime with Intl.DisplayNames, so no translation keys are needed.
 */
export const REGION_CODES = [
  'AR', 'AU', 'AT', 'BD', 'BE', 'BR', 'CA', 'CL', 'CN', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR',
  'DE', 'GH', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'KE', 'KR', 'MY', 'MX',
  'MA', 'NL', 'NZ', 'NG', 'NO', 'PK', 'PE', 'PH', 'PL', 'PT', 'RO', 'SA', 'SG', 'ZA', 'ES',
  'SE', 'CH', 'TW', 'TH', 'TR', 'UA', 'AE', 'GB', 'US', 'VN',
] as const

export type RegionCode = (typeof REGION_CODES)[number]

export function isRegionCode(v: unknown): v is RegionCode {
  return typeof v === 'string' && (REGION_CODES as readonly string[]).includes(v)
}
