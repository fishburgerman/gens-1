import { Link } from 'react-router-dom'
import { useFormat } from '../i18n/useFormat'
import { ChevronRightIcon, CompassIcon } from './Icons'

/** Gentle path from "my class" to the rest of the world. */
export function DiscoverCard() {
  const { t } = useFormat()
  return (
    <Link to="/explore" className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-4 active:bg-sand/40">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean/15 text-ocean-deep">
        <CompassIcon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{t('home.discoverTitle')}</span>
        <span className="block text-[13px] text-muted">{t('home.discoverBody')}</span>
      </span>
      <ChevronRightIcon size={18} className="shrink-0 text-muted" />
    </Link>
  )
}
