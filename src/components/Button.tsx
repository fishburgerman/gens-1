import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-ink text-paper active:bg-ink/85 disabled:bg-ink/25 disabled:text-paper',
  secondary: 'bg-surface text-ink border border-line active:bg-sand/60 disabled:text-muted',
  ghost: 'text-ink active:bg-sand/60 disabled:text-muted',
  danger: 'bg-surface text-clay border border-clay/40 active:bg-clay/10',
}

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
