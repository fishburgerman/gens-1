import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/** iOS-style bottom sheet. */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        aria-label={t('common.close')}
        className="animate-fade absolute inset-0 bg-ink/25"
        onClick={onClose}
      />
      <div className="animate-sheet relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] bg-paper pb-safe shadow-[0_-8px_30px_rgba(48,58,59,0.08)]">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-sand-deep" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  )
}
