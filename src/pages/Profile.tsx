import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Feed } from '../components/Feed'
import { CloseIcon, LockIcon, RefreshIcon } from '../components/Icons'
import { PageHeader } from '../components/Layout'
import { Sheet } from '../components/Sheet'
import { Shoreline } from '../components/Sketch'
import { useToast } from '../components/Toast'
import { className as classLabel, getGeneration } from '../config/generations'
import { MAX_BIO_LENGTH, MAX_NAME_LENGTH, RuleError } from '../lib/rules'
import { useProfile, useStore } from '../state/store'

export function Profile() {
  const profile = useProfile()
  const { posts, resetDemo } = useStore()
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const navigate = useNavigate()
  const generation = getGeneration(profile.generationId)
  const mine = posts
    .filter((p) => p.authorId === profile.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <PageHeader title="Profile" />
      <section className="px-4">
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.displayName} seed={profile.id} size={64} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-[22px]">{profile.displayName}</h2>
              <p className="text-[14px] text-muted">{classLabel(profile.birthYear)}</p>
            </div>
          </div>
          <p className={`mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed ${profile.bio ? '' : 'text-muted'}`}>
            {profile.bio || 'No bio yet.'}
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <Stat label="Born" value={String(profile.birthYear)} />
            <Stat label="Generation" value={generation?.shortName ?? '—'} />
            <Stat label="Class" value={`’${String(profile.birthYear).slice(2)}`} />
          </dl>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setEditing(true)}>
            Edit profile
          </Button>
        </div>
      </section>

      <h2 className="mt-8 px-5 font-display text-[19px]">Your posts</h2>
      <Shoreline className="mb-3 mt-2 px-5 text-sand-deep" />
      <section className="px-4">
        <Feed posts={mine} showScope empty={{ title: 'No posts yet', body: 'What you share in your class or generation will show up here.' }} />
      </section>

      <section className="mx-4 mt-6 rounded-card border border-dashed border-sand-deep p-4">
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-muted">Developer</h3>
        <p className="mt-1 text-[14px] text-muted">
          Clears your profile and posts on this device and restores the sample posts, so you can redo onboarding.
        </p>
        <Button variant="danger" className="mt-3 w-full" onClick={() => setConfirmReset(true)}>
          <RefreshIcon size={18} /> Reset demo
        </Button>
      </section>
      <p className="px-6 py-6 text-center text-[12px] text-muted">gens v0.1 · demo data is stored on this device only</p>

      <Sheet open={editing} onClose={() => setEditing(false)} label="Edit profile">
        {editing && <EditProfile onDone={() => setEditing(false)} />}
      </Sheet>
      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} label="Reset demo">
        <div className="px-5 pb-4 pt-4">
          <h2 className="font-display text-[20px]">Reset the demo?</h2>
          <p className="mt-2 text-[15px] text-muted">Your profile and every post you wrote on this device will be deleted. This can't be undone.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { navigate('/', { replace: true }); resetDemo() }}>Reset</Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-medium">{value}</dd>
    </div>
  )
}

function EditProfile({ onDone }: { onDone: () => void }) {
  const profile = useProfile()
  const { editProfile } = useStore()
  const toast = useToast()
  const [name, setName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio)
  const [error, setError] = useState<string | null>(null)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      editProfile({ displayName: name, bio })
      toast('Profile updated')
      onDone()
    } catch (err) {
      setError(err instanceof RuleError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <form onSubmit={save} className="flex min-h-0 flex-col overflow-y-auto px-5 pb-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onDone} aria-label="Cancel" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-muted active:bg-sand/60">
          <CloseIcon />
        </button>
        <h2 className="font-display text-[17px]">Edit profile</h2>
        <span className="w-11" />
      </div>
      <label htmlFor="edit-name" className="mb-2 mt-3 block text-[14px] font-medium">Display name</label>
      <input
        id="edit-name"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => { setName(e.target.value); setError(null) }}
        className="h-12 w-full rounded-2xl border border-line bg-surface px-4 focus:border-ocean focus:outline-none"
      />
      <label htmlFor="edit-bio" className="mb-2 mt-5 block text-[14px] font-medium">Bio</label>
      <textarea
        id="edit-bio"
        value={bio}
        rows={3}
        maxLength={MAX_BIO_LENGTH}
        onChange={(e) => { setBio(e.target.value); setError(null) }}
        placeholder="A line or two about you"
        className="w-full resize-none rounded-2xl border border-line bg-surface p-4 leading-relaxed placeholder:text-muted/70 focus:border-ocean focus:outline-none"
      />
      <div className="mt-1 text-right text-[12px] tabular-nums text-muted">{bio.length}/{MAX_BIO_LENGTH}</div>

      <div className="mt-3 flex items-start gap-3 rounded-2xl bg-sand/60 p-3 text-[13px] text-muted">
        <LockIcon size={18} className="mt-0.5 shrink-0" />
        <span>
          Birth year, generation and class ({classLabel(profile.birthYear)}) are set at sign-up and can't be changed here.
        </span>
      </div>
      {error && <p className="mt-3 text-[14px] text-clay" role="alert">{error}</p>}
      <Button type="submit" className="mt-5 w-full">Save</Button>
    </form>
  )
}
