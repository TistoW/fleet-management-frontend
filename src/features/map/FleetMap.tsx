import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { VehicleView } from '../../api/vehicles'
import { vehicleIcon } from '../vehicles/vehicleIcon'

interface Props {
  vehicles: VehicleView[]
  /** Changes when the filter changes; null while the list is a stale placeholder. The map re-fits only then. */
  fitKey: string | null
  /** Vehicle to centre on, from "Lihat di peta". */
  focusId?: string | null
  onOpen: (id: string) => void
}

const BOSTON: [number, number] = [42.3601, -71.0589]
const FALLBACK = { color: '#6B7280', text: '#FFFFFF' }

/** Fit once per filter, not on every 30 s refresh, so a map the user panned does not jump back. */
function FitBounds({ points, fitKey }: { points: [number, number][]; fitKey: string | null }) {
  const map = useMap()
  const done = useRef<string | null>(null)
  useEffect(() => {
    if (fitKey === null || done.current === fitKey || points.length === 0) return
    done.current = fitKey
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15, animate: false })
  }, [map, points, fitKey])
  return null
}

/** The lazy chunk mounts before the layout settles, which leaves tiles grey; re-measure on resize. */
function Remeasure() {
  const map = useMap()
  useEffect(() => {
    const raf = requestAnimationFrame(() => map.invalidateSize())
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => map.invalidateSize())
    ro?.observe(map.getContainer())
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [map])
  return null
}

/** Centre on one vehicle once; later refreshes do not pull the map back. */
function Focus({ target }: { target?: [number, number] }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (!target || done.current) return
    done.current = true
    map.setView(target, 16, { animate: false })
  }, [map, target])
  return null
}

export default function FleetMap({ vehicles, fitKey, focusId, onOpen }: Props) {
  const [tileFailed, setTileFailed] = useState(false)
  const placed = useMemo(() => vehicles.filter((v) => v.lat != null && v.lng != null), [vehicles])
  const focus = placed.find((v) => v.id === focusId)
  const focusAt = useMemo((): [number, number] | undefined => (focus ? [focus.lat!, focus.lng!] : undefined), [focus?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const points = useMemo(() => placed.map((v): [number, number] => [v.lat!, v.lng!]), [placed])

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-line">
      <MapContainer center={BOSTON} zoom={11} className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileFailed(true), tileload: () => setTileFailed(false) }}
        />
        {placed.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat!, v.lng!]}
            icon={vehicleIcon(v.route?.color ?? FALLBACK.color, v.route?.textColor ?? FALLBACK.text, v.bearing)}
            title={`Kendaraan ${v.label}${v.route ? `, ${v.route.name}` : ''}`}
            eventHandlers={{ click: () => onOpen(v.id) }}
          />
        ))}
        <FitBounds points={points} fitKey={focus ? null : fitKey} />
        <Focus target={focusAt} />
        <Remeasure />
      </MapContainer>
      {tileFailed && (
        <p role="status" className="absolute inset-x-2 bottom-8 z-[1000] rounded-md bg-paper/95 px-3 py-2 text-xs text-ink-muted shadow-sm">
          Gambar peta gagal dimuat. Posisi kendaraan tetap bisa dibuka dari daftar.
        </p>
      )}
    </div>
  )
}
