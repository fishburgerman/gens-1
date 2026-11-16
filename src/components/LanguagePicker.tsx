import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'
import { LANGUAGES, isLanguage } from '../i18n/languages'
import type { Language } from '../i18n/languages'

/** Segmented control. Labels are always shown in their own language. */
export function LanguagePicker({ onChange, size = 'md' }: { onChange?: (l: Language) => void; size?: 'sm' | 'md' }) {
  const { t, i18n } = useTranslation()
  const current = isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'
  return (
    <div
      role="radiogroup"
      aria-label={t('settings.language')}
      className={`grid grid-cols-3 gap-1 rounded-full bg-sand/70 p-1 ${size === 'sm' ? 'w-full max-w-[17rem]' : 'w-full'}`}
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = code === current
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            lang={code}
            onClick={() => {
              if (active) return
              changeLanguage(code)
              onChange?.(code)
            }}
            className={`rounded-full font-medium transition-colors ${size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-[14px]'} ${
              active ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(48,58,59,0.08)]' : 'text-muted'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
