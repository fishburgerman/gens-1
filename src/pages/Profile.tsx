import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Feed } from '../components/Feed'
import { CloseIcon, LockIcon, PinIcon, SlidersIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { RegionSelect } from '../components/RegionSelect'
import { Sheet } from '../components/Sheet'
import { Shoreline } from '../components/Sketch'
import { useToast } from '../components/Toast'
import { useFormat } from '../i18n/useFormat'
import { MAX_BIO_LENGTH, MAX_NAME_LENGTH } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function Profile() {
  const profile = useProfile()
  const { posts } = useStore()
  const { t, className, classShort, generationShort, regionName } = useFormat()
  const [editing, setEditing] = useState(false)
  const mine = posts
    .filter((p) => p.authorId === profile.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        trailing={
          <Link
            to="/settings"
            aria-label={t('profile.settings')}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-sand/60"
          >
            <SlidersIcon />
          </Link>
        }
      />
      <section className="px-4">
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.displayName} seed={profile.id} size={64} />
            <div className="min-w-0 flex-1">
              <h2 dir="auto" className="truncate font-display text-[22px]">{profile.displayName}</h2>
              <p className="text-[14px] text-muted">{className(profile.birthYear)}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
                <PinIcon size={15} className="shrink-0" />
                <span className="truncate">{profile.region ? regionName(profile.region) : t('profile.noRegion')}</span>
              </p>
            </div>
          </div>
          {/* User content: never translated */}
          <p dir="auto" className={`post-body mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed ${profile.bio ? '' : 'text-muted'}`}>
            {profile.bio || t('profile.noBio')}
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <Stat label={t('labels.born')} value={String(profile.birthYear)} />
            <Stat label={t('labels.generation')} value={generationShort(profile.generationId)} />
            <Stat label={t('labels.class')} value={classShort(profile.birthYear)} />
          </dl>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setEditing(true)}>
            {t('profile.edit')}
          </Button>
        </div>
      </section>

      <h2 className="mt-8 px-5 font-display text-[19px]">{t('profile.yourPosts')}</h2>
      <Shoreline className="mb-3 mt-2 px-5 text-sand-deep" />
      <section className="px-4">
        <Feed posts={mine} showScope empty={{ title: t('profile.emptyTitle'), body: t('profile.emptyBody') }} />
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} label={t('profile.editTitle')}>
        {editing && <EditProfile onDone={() => setEditing(false)} />}
      </Sheet>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-medium">{value}</dd>
    </div>
  )
}

function EditProfile({ onDone }: { onDone: () => void }) {
  const profile = useProfile()
  const { editProfile } = useStore()
  const { t, className, errorMessage } = useFormat()
  const toast = useToast()
  const [name, setName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio)
  const [region, setRegion] = useState<string | null>(profile.region)
  const [error, setError] = useState<unknown>(null)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      editProfile({ displayName: name, bio, region })
      toast(t('profile.updated'))
      onDone()
    } catch (err) {
      setError(err)
    }
  }

  return (
    <form onSubmit={save} className="flex min-h-0 flex-col overflow-y-auto px-5 pb-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onDone} aria-label={t('common.cancel')} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-muted active:bg-sand/60">
          <CloseIcon />
        </button>
        <h2 className="font-display text-[17px]">{t('profile.editTitle')}</h2>
        <span className="w-11" />
      </div>
      <label htmlFor="edit-name" className="mb-2 mt-3 block text-[14px] font-medium">{t('welcome.nameLabel')}</label>
      <input
        id="edit-name"
        value={name}
        dir="auto"
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => { setName(e.target.value); setError(null) }}
        className="h-12 w-full rounded-2xl border border-line bg-surface px-4 focus:border-ocean focus:outline-none"
      />
      <label htmlFor="edit-bio" className="mb-2 mt-5 block text-[14px] font-medium">{t('profile.bioLabel')}</label>
      <textarea
        id="edit-bio"
        value={bio}
        rows={3}
        dir="auto"
        maxLength={MAX_BIO_LENGTH}
        onChange={(e) => { setBio(e.target.value); setError(null) }}
        placeholder={t('profile.bioPlaceholder')}
        className="w-full resize-none rounded-2xl border border-line bg-surface p-4 leading-relaxed placeholder:text-muted/70 focus:border-ocean focus:outline-none"
      />
      <div className="mt-1 text-right text-[12px] tabular-nums text-muted">{bio.length}/{MAX_BIO_LENGTH}</div>

      <label htmlFor="edit-region" className="mb-2 mt-2 block text-[14px] font-medium">{t('welcome.regionLabel')}</label>
      <RegionSelect id="edit-region" value={region} onChange={(v) => { setRegion(v); setError(null) }} />
      <p className="mt-2 text-[12.5px] text-muted">{t('welcome.regionHelp')}</p>

      <div className="mt-3 flex items-start gap-3 rounded-2xl bg-sand/60 p-3 text-[13px] text-muted">
        <LockIcon size={18} className="mt-0.5 shrink-0" />
        <span>{t('profile.lockedNote', { className: className(profile.birthYear) })}</span>
      </div>
      {error !== null && <p className="mt-3 text-[14px] text-clay" role="alert">{errorMessage(error)}</p>}
      <Button type="submit" className="mt-5 w-full">{t('common.save')}</Button>
    </form>
  )
}
