import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'

export default function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line bg-paper p-8">
      <Icon icon="solar:bus-bold-duotone" className="size-10 text-ink-muted" aria-hidden />
      <div>
        <h2 className="font-semibold">{title}</h2>
        {message && <p className="mt-1 text-sm text-ink-muted">{message}</p>}
      </div>
      {action}
    </div>
  )
}
