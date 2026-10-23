import { Icon } from '@iconify/react'
import { statusInfo } from '../lib/status'

export default function StatusBadge({ status }: { status: string | null }) {
  const s = statusInfo(status)
  return (
    <div className="flex flex-col items-start gap-1" title={status ?? 'null'}>
      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${s.tone}`}>
        <Icon icon={s.icon} className="size-4" aria-hidden />
        {s.label}
      </span>
      <span className="font-mono text-xs text-ink-muted">{status ?? 'null'}</span>
    </div>
  )
}
