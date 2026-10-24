import { Icon } from '@iconify/react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { OptionSkeleton } from './Skeletons'

export interface Option {
  value: string
  label: string
  description?: string
  /** Optional color dot, any CSS color. */
  swatch?: string
  /** Options with the same group are listed together under a heading. */
  group?: string
}

interface Props {
  label: string
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  /** Chips for selected values that are not in `options` (not loaded yet). */
  selectedOptions?: Option[]
  disabled?: boolean
  disabledHint?: string
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  emptyText?: string
  /** The page shows its own removable chips. */
  hideChips?: boolean
  /** Toolbar mode: no visible label or hint (aria-label and title carry them); wrapper classes via `className`. */
  compact?: boolean
  className?: string
}

/** While searching, stop auto-loading after this many pages and offer a button. */
const MAX_AUTO_PAGES_PER_QUERY = 5

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Pilih',
  hideChips,
  compact,
  className = '',
  selectedOptions = [],
  disabled,
  disabledHint,
  isLoading,
  error,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  emptyText = 'Tidak ada pilihan',
}: Props) {
  const id = useId()
  const listId = `${id}-list`
  const hintId = `${id}-hint`
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [autoPages, setAutoPages] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const sentinel = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const next = input.trim().toLowerCase()
      // Only a changed query resets the cursor; the mount-time tick must not undo an early ArrowDown.
      setQuery((prev) => {
        if (prev !== next) {
          setActive(0)
          setAutoPages(0)
        }
        return next
      })
    }, 200)
    return () => clearTimeout(t)
  }, [input])

  const filtered = useMemo(
    () =>
      query
        ? options.filter((o) => `${o.label} ${o.description ?? ''} ${o.value}`.toLowerCase().includes(query))
        : options,
    [options, query],
  )

  const chips = selected.map(
    (v) => options.find((o) => o.value === v) ?? selectedOptions.find((o) => o.value === v) ?? { value: v, label: v },
  )

  const autoLoad = !query || autoPages < MAX_AUTO_PAGES_PER_QUERY
  const loadMore = () => {
    if (query) setAutoPages((n) => n + 1)
    onLoadMore?.()
  }
  const loadMoreRef = useRef(loadMore)
  useEffect(() => {
    loadMoreRef.current = loadMore
  })

  // The sentinel sits at the end of the scrollable list. It stays visible while results are
  // short, so searching keeps loading pages until something matches or the data runs out.
  useEffect(() => {
    const el = sentinel.current
    if (!open || !el || !hasMore || isLoadingMore || !autoLoad || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMoreRef.current(), {
      root: list.current,
      rootMargin: '0px 0px 120px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [open, hasMore, isLoadingMore, autoLoad, filtered.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open) search.current?.focus()
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active, id])

  const close = () => {
    setOpen(false)
    setInput('')
    trigger.current?.focus()
  }

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = filtered.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((i) => Math.min(i + 1, last))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        if (!input) {
          e.preventDefault()
          setActive(0)
        }
        break
      case 'End':
        if (!input) {
          e.preventDefault()
          setActive(Math.max(last, 0))
        }
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[active]) toggle(filtered[active].value)
        break
      case ' ':
        // Space types a space once a search is in progress, otherwise it toggles.
        if (!input && filtered[active]) {
          e.preventDefault()
          toggle(filtered[active].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        close()
        break
      case 'Backspace':
        if (!input && selected.length) onChange(selected.slice(0, -1))
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  let lastGroup: string | undefined
  const summary = selected.length ? `${selected.length} dipilih` : placeholder

  return (
    <div ref={root} className={`relative ${className}`}>
      {!compact && <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>}
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-describedby={disabled && disabledHint ? hintId : undefined}
        aria-label={`${label}: ${summary}`}
        title={compact && disabled ? disabledHint : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted"
      >
        <span className={selected.length ? 'text-ink' : 'text-ink-muted'}>{summary}</span>
        <Icon icon="solar:alt-arrow-down-linear" className="size-4 text-ink-muted" aria-hidden />
      </button>
      {disabled && disabledHint && (
        <p id={hintId} className={compact ? 'sr-only' : 'mt-1 text-xs text-ink-muted'}>
          {disabledHint}
        </p>
      )}

      {chips.length > 0 && !hideChips && (
        <ul aria-label={`${label} terpilih`} className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li
              key={c.value}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-accent-soft py-0.5 pl-2 pr-1 text-sm"
            >
              {c.swatch && <span className="size-2.5 rounded-full" style={{ backgroundColor: c.swatch }} aria-hidden />}
              {c.label}
              <button
                type="button"
                aria-label={`Hapus ${c.label}`}
                onClick={() => toggle(c.value)}
                className="rounded text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Icon icon="solar:close-circle-bold" className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-line bg-paper shadow-lg">
          <div className="relative border-b border-line p-2">
            <Icon
              icon="solar:magnifer-linear"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              ref={search}
              type="text"
              role="combobox"
              aria-label={`Cari ${label}`}
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={filtered[active] ? `${id}-opt-${active}` : undefined}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onSearchKey}
              placeholder="Cari"
              className="h-9 w-full rounded-lg border border-line pl-8 pr-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="max-h-64 overflow-y-auto py-1"
          >
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => <OptionSkeleton key={i} />)}

            {!isLoading &&
              filtered.map((o, i) => {
                const heading = o.group !== lastGroup && o.group
                lastGroup = o.group
                const on = selected.includes(o.value)
                return (
                  <li key={o.value} role="presentation">
                    {heading && (
                      <div className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-muted" aria-hidden>
                        {heading}
                      </div>
                    )}
                    <div
                      id={`${id}-opt-${i}`}
                      role="option"
                      aria-selected={on}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(o.value)}
                      onMouseMove={() => setActive(i)}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${
                        i === active ? 'bg-canvas' : ''
                      } ${on ? 'bg-accent-soft' : ''}`}
                    >
                      <Icon
                        icon={on ? 'solar:check-square-bold' : 'solar:stop-linear'}
                        className={`size-4 shrink-0 ${on ? 'text-accent' : 'text-ink-muted'}`}
                        aria-hidden
                      />
                      {o.swatch && (
                        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: o.swatch }} aria-hidden />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{o.label}</span>
                        {o.description && <span className="block truncate text-xs text-ink-muted">{o.description}</span>}
                      </span>
                    </div>
                  </li>
                )
              })}

            {!isLoading && !error && filtered.length === 0 && !hasMore && !isLoadingMore && (
              <li role="presentation" className="px-3 py-3 text-sm text-ink-muted">
                {query ? `Tidak ada hasil untuk "${input.trim()}" di ${options.length} item yang sudah dimuat` : emptyText}
              </li>
            )}

            {!isLoading && !error && filtered.length === 0 && query && (hasMore || isLoadingMore) && (
              <li role="presentation" className="px-3 py-3 text-sm text-ink-muted">
                Belum ada yang cocok di {options.length} item yang sudah dimuat
              </li>
            )}

            {error && (
              <li role="presentation" className="flex items-center justify-between gap-2 px-3 py-3 text-sm text-danger">
                <span>{error}</span>
                {onRetry && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onRetry}
                    className="rounded border border-line px-2 py-1 text-ink hover:bg-canvas"
                  >
                    Coba lagi
                  </button>
                )}
              </li>
            )}

            {isLoadingMore && <OptionSkeleton />}

            {hasMore && !isLoading && !isLoadingMore && !error && (
              <li ref={sentinel} role="presentation" className="px-3 py-2">
                {!autoLoad && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={loadMore}
                    className="w-full rounded border border-line px-2 py-1 text-sm hover:bg-canvas"
                  >
                    Muat lebih banyak
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
