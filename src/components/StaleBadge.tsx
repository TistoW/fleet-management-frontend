import { Icon } from '@iconify/react'

/** Shown when the last GPS fix is more than 5 minutes old. */
export default function StaleBadge({ small }: { small?: boolean }) {
  return (
    <span
      title="Posisi terakhir lebih dari 5 menit yang lalu"
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-arriving-soft font-medium text-arriving ${small ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'}`}
    >
      <Icon icon="solar:danger-triangle-linear" className={small ? 'size-3.5' : 'size-4'} aria-hidden />
      GPS tidak update
    </span>
  )
}
