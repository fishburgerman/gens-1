import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../state/store'
import { CompassIcon, HomeIcon, PenIcon, PersonIcon, WaveIcon } from './Icons'
import type { Destination } from './Composer'
import { useComposer } from './Composer'

const TABS = [
  { to: '/', label: 'nav.home', Icon: HomeIcon, end: true },
  { to: '/generation', label: 'nav.generation', Icon: WaveIcon, end: false },
  { to: '/explore', label: 'nav.explore', Icon: CompassIcon, end: false },
  { to: '/profile', label: 'nav.profile', Icon: PersonIcon, end: false },
] as const

export function AppLayout() {
  const { pathname } = useLocation()
  const { persisted } = useStore()
  const { t } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      {!persisted && (
        <div className="pt-safe bg-sand px-4 py-2 text-center text-[13px] text-ink">
          {t('common.notSaving')}
        </div>
      )}
      <main className="pb-[calc(96px_+_env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function BottomNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-safe backdrop-blur-md"
    >
      <ul className="mx-auto grid h-[60px] max-w-lg grid-cols-4">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive: active }) => {
                const isActive = active || (to === '/profile' && pathname.startsWith('/settings'))
                return `flex h-full flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] font-medium leading-tight transition-colors ${
                  isActive ? 'text-ink' : 'text-muted'
                }`
              }}
            >
              {({ isActive: active }) => (
                <>
                  <Icon size={24} strokeWidth={active || (to === '/profile' && pathname.startsWith('/settings')) ? 1.9 : 1.5} />
                  <span className="max-w-full truncate">{t(label)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  leading,
  trailing,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <header className="pt-safe">
      <div className="flex items-start gap-2 px-5 pb-4 pt-5">
        {leading}
        <div className="min-w-0 flex-1">
          {eyebrow && <div className="mb-1 text-[13px] font-medium text-muted">{eyebrow}</div>}
          <h1 className="font-display text-[28px] leading-tight tracking-tight [overflow-wrap:anywhere]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
        </div>
        {trailing}
      </div>
    </header>
  )
}

export function ComposeButton({ destination, label }: { destination: Destination; label: string }) {
  const openComposer = useComposer()
  return (
    <button
      type="button"
      onClick={() => openComposer({ destination })}
      aria-label={label}
      className="fixed right-[max(1.25rem,calc(50vw_-_16rem_+_1.25rem))] bottom-[calc(76px_+_env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-[0_6px_18px_rgba(48,58,59,0.18)] transition-transform active:scale-95"
    >
      <PenIcon size={22} />
    </button>
  )
}
