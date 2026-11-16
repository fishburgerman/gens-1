const TONES = ['bg-sand text-ink', 'bg-sage/45 text-ink', 'bg-ocean/35 text-ink', 'bg-[#E9D9CC] text-ink']

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function Avatar({ name, seed, size = 40 }: { name: string; seed: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${TONES[hash(seed) % TONES.length]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials || '·'}
    </span>
  )
}
