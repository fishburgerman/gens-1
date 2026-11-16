import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckIcon } from './Icons'

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((m: string) => {
    setMessage(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2400)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center pt-safe">
        {message && (
          <div className="animate-rise mt-3 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] text-paper shadow-[0_6px_20px_rgba(48,58,59,0.18)]">
            <CheckIcon size={18} />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
