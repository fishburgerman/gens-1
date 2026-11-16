import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { ChevronLeftIcon, GlobeIcon, RefreshIcon } from '../components/Icons'
import { LanguagePicker } from '../components/LanguagePicker'
import { PageHeader } from '../components/Layout'
import { Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'
import i18n from '../i18n'
import { useFormat } from '../i18n/useFormat'
import { useStore } from '../state/store'

export function Settings() {
  const { resetDemo } = useStore()
  const { t } = useFormat()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <PageHeader
        leading={
          <Link to="/profile" aria-label={t('common.back')} className="-ml-2 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-sand/60">
            <ChevronLeftIcon />
          </Link>
        }
        title={t('settings.title')}
      />

      <section className="mx-4 rounded-card border border-line bg-surface p-5" aria-labelledby="lang-heading">
        <h2 id="lang-heading" className="flex items-center gap-2 text-[15px] font-semibold">
          <GlobeIcon size={20} className="text-ocean-deep" />
          {t('settings.language')}
        </h2>
        <p className="mt-1.5 text-[14px] text-muted">{t('settings.languageHelp')}</p>
        <div className="mt-4">
          <LanguagePicker onChange={(lng) => toast(i18n.t('settings.languageChanged', { lng }))} />
        </div>
      </section>

      <section className="mx-4 mt-6 rounded-card border border-dashed border-sand-deep p-4">
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-muted">{t('settings.developer')}</h3>
        <p className="mt-1 text-[14px] text-muted">{t('settings.resetHelp')}</p>
        <Button variant="danger" className="mt-3 w-full" onClick={() => setConfirmReset(true)}>
          <RefreshIcon size={18} /> {t('settings.reset')}
        </Button>
      </section>
      <p className="px-6 py-6 text-center text-[12px] text-muted">{t('common.version', { version: __APP_VERSION__ })}</p>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} label={t('settings.reset')}>
        <div className="px-5 pb-4 pt-4">
          <h2 className="font-display text-[20px]">{t('settings.resetConfirmTitle')}</h2>
          <p className="mt-2 text-[15px] text-muted">{t('settings.resetConfirmBody')}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { navigate('/', { replace: true }); resetDemo() }}>
              {t('settings.resetConfirm')}
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
