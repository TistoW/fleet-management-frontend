import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (q: string) => void
  /** Desktop only: "/" focuses the field. */
  shortcut?: boolean
  autoFocus?: boolean
  className?: string
}

const DEBOUNCE_MS = 200

/** Typing is local and reaches the URL after a short pause; clear and Esc apply at once. */
export default function SearchField({ value, onChange, shortcut, autoFocus, className = '' }: Props) {
  const [text, setText] = useState(value)
  const sent = useRef(value)
  const input = useRef<HTMLInputElement>(null)
  const cb = useRef(onChange)
  useEffect(() => {
    cb.current = onChange
  })

  // Changed from outside (chip removed, back/forward): follow the URL.
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value
      setText(value)
    }
  }, [value])

  useEffect(() => {
    if (text === sent.current) return
    const id = setTimeout(() => {
      sent.current = text
      cb.current(text)
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [text])

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || t?.closest('input,textarea,select,[contenteditable="true"]')) return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  const clear = () => {
    setText('')
    sent.current = ''
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        ref={input}
        type="search"
        autoFocus={autoFocus}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && text) {
            e.preventDefault()
            clear()
          }
        }}
        placeholder="Cari label kendaraan, rute, atau tujuan..."
        aria-label="Cari kendaraan"
        enterKeyHint="search"
        className="h-11 w-full rounded-xl border border-line bg-paper pl-11 pr-10 text-sm outline-none placeholder:text-ink-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            clear()
            input.current?.focus()
          }}
          aria-label="Kosongkan pencarian"
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon icon="solar:close-circle-linear" className="size-5" aria-hidden />
        </button>
      )}
    </div>
  )
}
