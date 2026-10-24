import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'

export default function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <span className="flex size-20 items-center justify-center rounded-3xl bg-accent-soft text-accent">
        <Icon icon="solar:bus-linear" className="size-10" aria-hidden />
      </span>
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold">{title}</h2>
        {message && <p className="mt-1 text-sm text-ink-muted">{message}</p>}
      </div>
      {action}
    </div>
  )
}

export const primaryBtn =
  'inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
