/** Decorative hand-drawn accents. Keep usage sparse. */

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-display text-ink ${className}`}>
      <span className="tracking-tight">gens</span>
      <svg width="0.55em" height="0.3em" viewBox="0 0 22 12" aria-hidden="true" className="text-ocean">
        <path d="M1 7c3-4 6-4 9 0s6 4 11-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** A soft, slightly wobbly shoreline used as a divider. */
export function Shoreline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 16" preserveAspectRatio="none" className={`h-3 w-full ${className}`} aria-hidden="true">
      <path
        d="M0 9c18-5 34-6 52-2s32 5 50 1 36-6 54-2 34 6 52 2 34-5 52-2 30 4 60 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Line-art coastal scene for the welcome screen. */
export function CoastScene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 150" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* sun */}
      <circle cx="226" cy="58" r="22" stroke="#C9A98A" strokeWidth="1.3" />
      <path d="M226 26v-8M258 58h8M249 35l6-6M203 35l-6-6" stroke="#C9A98A" strokeWidth="1.1" />
      {/* hills */}
      <path d="M0 98c30-14 58-20 92-12s56 6 82-2" stroke="#A8B8A0" strokeWidth="1.4" />
      {/* palm */}
      <path d="M70 92c1-18 3-34 9-46" stroke="#303A3B" strokeWidth="1.2" />
      <path d="M79 46c-8-6-18-6-25 0M79 46c-2-9-9-14-17-15M79 46c6-8 15-10 22-6M79 46c8-2 15 2 18 9M79 46c-1 8-6 13-12 15" stroke="#303A3B" strokeWidth="1.1" />
      {/* waves */}
      <path d="M0 112c20-8 38-8 56 0s36 8 54 0 38-8 56 0 36 8 54 0 38-8 56 0 30 6 44 2" stroke="#86AFC0" strokeWidth="1.4" />
      <path d="M18 126c18-6 34-6 50 0s34 6 50 0 34-6 50 0 34 6 50 0 34-6 50 0" stroke="#86AFC0" strokeWidth="1.1" opacity=".7" />
      <path d="M44 139c16-4 30-4 46 0s30 4 46 0 30-4 46 0 30 4 46 0" stroke="#86AFC0" strokeWidth="1" opacity=".45" />
    </svg>
  )
}
