import { Icon } from '@iconify/react'

export interface Chip {
  key: string
  label: string
  swatch?: string
  onRemove: () => void
}

/** Removable chips for every active filter, with a count and a clear-all action. */
export default function ActiveFilters({ chips, onClear }: { chips: Chip[]; onClear: () => void }) {
  if (chips.length === 0) return null
  return (
    <div className="flex items-center gap-2 max-md:-mx-4 max-md:overflow-x-auto max-md:px-4 md:flex-wrap">
      <p className="shrink-0 text-sm font-medium tabular-nums" aria-live="polite">
        {chips.length} filter aktif
      </p>
      <ul aria-label="Filter aktif" className="flex gap-1.5 md:flex-wrap">
        {chips.map((c) => (
          <li
            key={c.key}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-accent-soft py-1 pl-3 pr-1.5 text-sm"
          >
            {c.swatch && <span className="size-2.5 rounded-full" style={{ backgroundColor: c.swatch }} aria-hidden />}
            {c.label}
            <button
              type="button"
              aria-label={`Hapus ${c.label}`}
              onClick={c.onRemove}
              className="flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon icon="solar:close-circle-linear" className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-accent hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Hapus semua
      </button>
    </div>
  )
}
