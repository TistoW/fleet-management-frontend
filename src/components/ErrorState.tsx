import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { ApiError, describeError, secondsToNextMinute } from '../api/errors'

/** `preview` draws the same message as a quiet card (no alert role, no button) for the simulation page. */
export default function ErrorState({ error, onRetry, preview }: { error: unknown; onRetry?: () => void; preview?: boolean }) {
  const info = describeError(error)
  const limited = error instanceof ApiError && error.status === 429
  const [seconds, setSeconds] = useState(secondsToNextMinute)

  useEffect(() => {
    if (!limited) return
    const t = setInterval(() => setSeconds(secondsToNextMinute()), 1000)
    return () => clearInterval(t)
  }, [limited])

  return (
    <div role={preview ? undefined : 'alert'} className={`flex flex-col items-start gap-3 rounded-2xl border border-line bg-paper ${preview ? 'p-4' : 'm-4 p-8'}`}>
      <Icon icon="solar:danger-triangle-bold-duotone" className="size-10 text-danger" aria-hidden />
      <div>
        <h2 className="font-semibold">{info.title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{info.message}</p>
        {limited && <p className="mt-1 text-sm text-ink-muted">Coba lagi dalam ±{seconds} detik.</p>}
        {info.technical && <p className="mt-2 font-mono text-xs text-ink-muted">{info.technical}</p>}
      </div>
      {!preview && onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {info.action}
      </button>
      )}
    </div>
  )
}
