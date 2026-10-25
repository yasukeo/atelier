import { cn } from '@/lib/utils'

/*
 * The eight-pointed star of the Elwarcha logo (khatam: "seal" in Arabic).
 * Used as the seal of unique originals, so it only ever marks a one-of-a-kind piece.
 */
export function Khatam({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect x="5.5" y="5.5" width="13" height="13" fill="currentColor" />
      <rect x="5.5" y="5.5" width="13" height="13" fill="currentColor" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="3.2" fill="var(--khatam-core, #E8920C)" />
    </svg>
  )
}
