import { Icon } from '@iconify/react'
import type { VehicleView } from '../../api/vehicles'
import Highlight from '../../components/Highlight'
import StatusBadge from '../../components/StatusBadge'
import { formatClockWib, formatCoord, formatRelativeShort } from '../../lib/format'
import { statusInfo } from '../../lib/status'

interface Props {
  vehicle: VehicleView
  onOpen: (id: string) => void
  onShowOnMap?: (id: string) => void
  query?: string
}

/** The whole card opens the detail; "Lihat di peta" sits above the stretched button. */
export default function VehicleCard({ vehicle: v, onOpen, onShowOnMap, query = '' }: Props) {
  const route = v.route
  const aria = `Kendaraan ${v.label}${route ? `, ${route.name}` : ''}, ${statusInfo(v.status).label}`
  return (
    <div className="group relative flex h-full flex-col gap-3.5 rounded-2xl border border-line bg-paper p-5 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-sm has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-accent">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen(v.id)}
          aria-label={aria}
          className="font-mono text-lg font-semibold tabular-nums outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          <Highlight text={v.label} query={query} />
        </button>
        {route && (
          <span
            className="max-w-[60%] truncate rounded-lg px-2 py-0.5 text-sm font-semibold"
            style={{ backgroundColor: route.color, color: route.textColor }}
            title={route.longName || route.name}
          >
            <Highlight text={route.name} query={query} />
          </span>
        )}
      </div>
      <StatusBadge status={v.status} />
      <dl className="grid grid-cols-2 gap-2 font-mono text-sm tabular-nums">
        <div>
          <dt className="font-sans text-xs text-ink-muted">Lat</dt>
          <dd>{formatCoord(v.lat)}</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-ink-muted">Lng</dt>
          <dd>{formatCoord(v.lng)}</dd>
        </div>
      </dl>
      <p className="mt-auto truncate whitespace-nowrap border-t border-line pt-3 text-xs text-ink-muted" title={`${formatClockWib(v.updatedAt)} WIB · ${formatRelativeShort(v.updatedAt)}`}>
        {formatClockWib(v.updatedAt)} WIB · {formatRelativeShort(v.updatedAt)}
      </p>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-line px-3 text-sm font-medium text-accent transition-colors group-hover:border-accent/40 group-hover:bg-accent-soft/50" aria-hidden>
          Lihat detail
          <Icon icon="solar:alt-arrow-right-linear" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </span>
        {onShowOnMap && v.lat != null && v.lng != null && (
          <button
            type="button"
            onClick={() => onShowOnMap(v.id)}
            aria-label="Lihat di peta"
            title="Lihat di peta"
            className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted hover:bg-canvas hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon icon="solar:map-point-wave-linear" className="size-5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
