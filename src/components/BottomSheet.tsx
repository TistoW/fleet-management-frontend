import { Icon } from '@iconify/react'
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [role="combobox"]'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/** Material-style modal bottom sheet: backdrop, rounded top, handle, focus trap, ESC and backdrop close. */
export default function BottomSheet({ title, onClose, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => opener?.focus?.()
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    if (e.key !== 'Tab' || !ref.current) return
    const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-[sheet-up_.22s_ease-out] flex-col rounded-t-3xl bg-paper shadow-[0_-8px_32px_rgba(0,0,0,.18)]"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line" aria-hidden />
        <div className="flex shrink-0 items-center justify-between px-5 pb-1 pt-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-2 flex size-12 items-center justify-center rounded-full text-ink-muted active:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon icon="solar:close-circle-linear" className="size-6" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 gap-3 border-t border-line px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>
        )}
      </div>
    </div>
  )
}
