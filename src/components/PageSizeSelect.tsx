import { PAGE_SIZES } from '../hooks/useUrlState'

export default function PageSizeSelect({ size, onChange }: { size: number; onChange: (size: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      Per halaman
      <select
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 rounded-lg border border-line bg-paper px-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}
