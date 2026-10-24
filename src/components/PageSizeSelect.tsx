import { Icon } from '@iconify/react'
import { PAGE_SIZES } from '../hooks/useUrlState'

export default function PageSizeSelect({ size, onChange }: { size: number; onChange: (size: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      Per halaman
      <span className="relative">
        <select
          value={size}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-10 appearance-none rounded-lg border border-line bg-paper pl-3 pr-9 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
      </span>
    </label>
  )
}
