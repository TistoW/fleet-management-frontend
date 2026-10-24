import { Icon } from '@iconify/react'
import type { VehicleView } from '../../api/vehicles'
import { formatCoord, formatRelative } from '../../lib/format'
import { statusInfo } from '../../lib/status'

interface Props {
  vehicle: VehicleView
  onOpen: (id: string) => void
  onShowOnMap?: (id: string) => void
}

/** Phone version of VehicleCard: a dense two-target list item, like an Android list row. */
export default function VehicleRow({ vehicle: v, onOpen, onShowOnMap }: Props) {
  const route = v.route
  const s = statusInfo(v.status)
  const aria = `Kendaraan ${v.label}${route ? `, ${route.name}` : ''}, ${s.label}`
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onOpen(v.id)}
        aria-label={aria}
        className="flex min-h-[76px] min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-2.5 text-left transition-colors active:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold tabular-nums">{v.label}</span>
          {route && (
            <span
              className="max-w-[9rem] truncate rounded-md px-1.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: route.color, color: route.textColor }}
            >
              {route.name}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${s.tone}`}>
            <Icon icon={s.icon} className="size-3.5" aria-hidden />
            {s.label}
          </span>
          <span className="font-mono text-[11px] text-ink-muted">{v.status ?? 'null'}</span>
        </span>
        <span className="truncate font-mono text-[11px] tabular-nums text-ink-muted">
          {formatCoord(v.lat)}, {formatCoord(v.lng)} · {formatRelative(v.updatedAt)}
        </span>
      </button>
      {onShowOnMap && v.lat != null && v.lng != null && (
        <button
          type="button"
          onClick={() => onShowOnMap(v.id)}
          aria-label={`Lihat ${v.label} di peta`}
          className="mr-1 flex size-12 shrink-0 items-center justify-center rounded-full text-accent active:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon icon="solar:map-point-wave-linear" className="size-6" aria-hidden />
        </button>
      )}
    </div>
  )
}
