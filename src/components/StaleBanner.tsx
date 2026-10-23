import { Icon } from '@iconify/react'
import { formatClockWib } from '../lib/format'

interface Props {
  /** Epoch ms of the last successful fetch. */
  updatedAt: number
  /** Seconds until the automatic retry after a 429, null for other errors. */
  countdown: number | null
  onRetry: () => void
}

/** Shown when a refresh failed but the previous data is still on screen. */
export default function StaleBanner({ updatedAt, countdown, onRetry }: Props) {
  return (
    <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-arriving-soft px-4 py-2 text-sm text-arriving">
      <p className="flex items-center gap-2">
        <Icon icon="solar:danger-triangle-bold" className="size-5 shrink-0" aria-hidden />
        <span>
          Gagal memperbarui, menampilkan data terakhir pukul {formatClockWib(new Date(updatedAt).toISOString())} WIB.
          {countdown !== null && ` Mencoba lagi dalam ±${countdown} detik.`}
        </span>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-arriving/40 px-3 py-1 font-medium hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Coba lagi
      </button>
    </div>
  )
}
