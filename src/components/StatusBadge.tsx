import { Icon } from '@iconify/react'
import { statusInfo } from '../lib/status'

/** Indonesian label only; the raw API value stays available as a tooltip. */
export default function StatusBadge({ status }: { status: string | null }) {
  const s = statusInfo(status)
  return (
    <span
      title={`Status API: ${status ?? 'null'}`}
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium ${s.tone}`}
    >
      <Icon icon={s.icon} className="size-4" aria-hidden />
      {s.label}
    </span>
  )
}
