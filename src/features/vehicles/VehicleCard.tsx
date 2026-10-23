import type { VehicleView } from '../../api/vehicles'
import StatusBadge from '../../components/StatusBadge'
import { formatClockWib, formatCoord, formatRelative } from '../../lib/format'
import { statusInfo } from '../../lib/status'

export default function VehicleCard({ vehicle: v, onOpen }: { vehicle: VehicleView; onOpen: (id: string) => void }) {
  const route = v.route
  const aria = `Kendaraan ${v.label}${route ? `, ${route.name}` : ''}, ${statusInfo(v.status).label}`
  return (
    <button
      type="button"
      onClick={() => onOpen(v.id)}
      aria-label={aria}
      className="flex w-full flex-col gap-3 rounded-lg border border-line bg-paper p-4 text-left transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-lg font-semibold tabular-nums">{v.label}</span>
        {route && (
          <span
            className="max-w-[60%] truncate rounded-md px-2 py-0.5 text-sm font-semibold"
            style={{ backgroundColor: route.color, color: route.textColor }}
            title={route.longName || route.name}
          >
            {route.name}
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
      <p className="border-t border-line pt-3 text-xs text-ink-muted">
        {formatClockWib(v.updatedAt)} WIB · {formatRelative(v.updatedAt)}
      </p>
    </button>
  )
}
