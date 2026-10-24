import { Icon } from '@iconify/react'

interface Props {
  icon: string
  /** Tailwind classes for the soft icon tile. */
  tint: string
  label: string
  value: number | string
  active?: boolean
  /** Without onClick the card is a plain figure. */
  onClick?: () => void
}

export default function StatCard({ icon, tint, label, value, active, onClick }: Props) {
  const body = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl max-md:size-7 ${tint}`}>
        <Icon icon={icon} className="size-6 max-md:size-4" aria-hidden />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-2xl max-md:text-xl font-semibold leading-tight tabular-nums">{value}</span>
        <span className="block truncate text-sm max-md:text-xs text-ink-muted">{label}</span>
      </span>
    </>
  )
  const base = 'flex min-w-[10.5rem] flex-1 items-center gap-3 rounded-2xl border bg-paper p-3.5 transition-colors max-md:w-[calc((100vw-4.5rem)/2)] max-md:min-w-0 max-md:gap-1.5 max-md:p-2'
  if (!onClick) return <div className={`${base} border-line`}>{body}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'border-accent bg-accent-soft/50 ring-1 ring-accent' : 'border-line hover:border-accent/40 hover:bg-canvas'
      }`}
    >
      {body}
    </button>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="flex min-w-[10.5rem] flex-1 items-center gap-3 rounded-2xl border border-line bg-paper p-4" aria-hidden>
      <div className="size-11 rounded-xl bg-line motion-safe:animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 w-12 rounded bg-line motion-safe:animate-pulse" />
        <div className="h-4 w-24 rounded bg-line motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
