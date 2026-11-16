import type { SVGProps } from 'react'

/** Thin line icons, slightly irregular strokes for a light hand-drawn feel. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 22, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => (
  <Base {...p}><path d="M4 11.2 12 4.5l8 6.7" /><path d="M6.2 9.6V19.3h11.6V9.6" /><path d="M10 19.3v-5.2h4v5.2" /></Base>
)
export const ClassIcon = (p: IconProps) => (
  <Base {...p}><circle cx="9" cy="9" r="3.1" /><circle cx="16.3" cy="10.2" r="2.4" /><path d="M3.8 19c.6-3 2.7-4.8 5.2-4.8s4.6 1.8 5.2 4.8" /><path d="M14.6 15.1c2.4-.4 4.7 1 5.5 3.6" /></Base>
)
export const CompassIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="8.2" /><path d="m14.9 9.1-1.7 4.1-4.1 1.7 1.7-4.1z" /></Base>
)
export const PersonIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="8.6" r="3.6" /><path d="M5 19.6c.9-3.6 3.6-5.6 7-5.6s6.1 2 7 5.6" /></Base>
)
export const PenIcon = (p: IconProps) => (
  <Base {...p}><path d="M15.4 5.2 18.8 8.6 9 18.4l-4.1.8.8-4.1z" /><path d="m13.6 7 3.4 3.4" /></Base>
)
export const CloseIcon = (p: IconProps) => (
  <Base {...p}><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" /></Base>
)
export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}><path d="M14.5 5.5 8 12l6.5 6.5" /></Base>
)
export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}><path d="M9.5 5.5 16 12l-6.5 6.5" /></Base>
)
export const EyeIcon = (p: IconProps) => (
  <Base {...p}><path d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6z" /><circle cx="12" cy="12" r="2.6" /></Base>
)
export const LockIcon = (p: IconProps) => (
  <Base {...p}><rect x="5.5" y="10.5" width="13" height="9" rx="2.4" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></Base>
)
export const SunIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="3.8" /><path d="M12 3.2v1.9M12 18.9v1.9M3.2 12h1.9M18.9 12h1.9M5.8 5.8l1.3 1.3M16.9 16.9l1.3 1.3M5.8 18.2l1.3-1.3M16.9 7.1l1.3-1.3" /></Base>
)
export const WaveIcon = (p: IconProps) => (
  <Base {...p}><path d="M3 14c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 6 0" /><path d="M3 9.5c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 6 0" opacity=".55" /></Base>
)
export const CheckIcon = (p: IconProps) => (
  <Base {...p}><path d="m5.5 12.5 4.2 4 8.8-9" /></Base>
)
export const ArrowUpIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 19V5.5M6.5 11 12 5.5 17.5 11" /></Base>
)
export const RefreshIcon = (p: IconProps) => (
  <Base {...p}><path d="M19 12a7 7 0 1 1-2.1-5" /><path d="M19 4.8v4.4h-4.4" /></Base>
)

/* Reaction icons */
export const SameIcon = (p: IconProps) => (
  // two overlapping circles: "same here"
  <Base {...p}><circle cx="9.3" cy="12" r="4.8" /><circle cx="14.7" cy="12" r="4.8" /></Base>
)
export const WarmIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 19.2s-7-4.3-7-9.3a3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 7 2.4c0 5-7 9.3-7 9.3z" /></Base>
)
export const ThoughtfulIcon = (p: IconProps) => (
  // a small leaf
  <Base {...p}><path d="M5.5 18.5C5.5 10 10.5 5.5 19 5.5c0 8.5-4.5 13-13 13z" /><path d="M5.5 18.5 13 11" /></Base>
)
export const SlidersIcon = (p: IconProps) => (
  <Base {...p}><path d="M4.5 7.5h9M17.5 7.5h2M4.5 16.5h2M10.5 16.5h9" /><circle cx="15.5" cy="7.5" r="2" /><circle cx="8.5" cy="16.5" r="2" /></Base>
)
export const GlobeIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="8.3" /><path d="M3.9 12h16.2M12 3.7c2.3 2.3 3.4 5.1 3.4 8.3s-1.1 6-3.4 8.3c-2.3-2.3-3.4-5.1-3.4-8.3s1.1-6 3.4-8.3z" /></Base>
)
export const BubbleIcon = (p: IconProps) => (
  <Base {...p}><path d="M5 6.5h14v9H11l-4 3.2v-3.2H5z" /></Base>
)
export const SearchIcon = (p: IconProps) => (
  <Base {...p}><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4.3 4.3" /></Base>
)
export const PinIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 20s-5.5-5.2-5.5-9.5a5.5 5.5 0 0 1 11 0C17.5 14.8 12 20 12 20z" /><circle cx="12" cy="10.5" r="1.9" /></Base>
)
