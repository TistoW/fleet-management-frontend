import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { ApiError, describeError, secondsToNextMinute } from '../api/errors'

export default function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const info = describeError(error)
  const limited = error instanceof ApiError && error.status === 429
  const [seconds, setSeconds] = useState(secondsToNextMinute)

  useEffect(() => {
    if (!limited) return
    const t = setInterval(() => setSeconds(secondsToNextMinute()), 1000)
    return () => clearInterval(t)
  }, [limited])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-line bg-paper p-8">
      <Icon icon="solar:danger-triangle-bold-duotone" className="size-10 text-danger" aria-hidden />
      <div>
        <h2 className="font-semibold">{info.title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{info.message}</p>
        {limited && <p className="mt-1 text-sm text-ink-muted">Coba lagi dalam ±{seconds} detik.</p>}
        {info.technical && <p className="mt-2 font-mono text-xs text-ink-muted">{info.technical}</p>}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {info.action}
      </button>
    </div>
  )
}
