import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useMemo, useRef } from 'react'
import type { VehicleView } from '../../api/vehicles'
import { isStale } from '../../lib/stale'
import { pinHtml } from '../vehicles/pin'
import { GoogleShell, GPolyline, Pin } from './GoogleShell'

interface Props {
  vehicles: VehicleView[]
  fitKey: string | null
  focusId?: string | null
  routeLines?: { color: string; lines: [number, number][][] }
  onOpen: (id: string) => void
  onFail: () => void
}

const FALLBACK = { color: '#6B7280', text: '#FFFFFF' }

function Camera({ points, fitKey, focus }: { points: google.maps.LatLngLiteral[]; fitKey: string | null; focus?: google.maps.LatLngLiteral }) {
  const map = useMap()
  const fitted = useRef<string | null>(null)
  const focused = useRef(false)
  useEffect(() => {
    if (!map) return
    if (focus) {
      if (focused.current) return
      focused.current = true
      map.setCenter(focus)
      map.setZoom(16)
      return
    }
    if (fitKey === null || fitted.current === fitKey || points.length === 0) return
    fitted.current = fitKey
    const b = new google.maps.LatLngBounds()
    points.forEach((p) => b.extend(p))
    map.fitBounds(b, 40)
    // Fitting a single point zooms to the max; keep it street level.
    google.maps.event.addListenerOnce(map, 'idle', () => (map.getZoom() ?? 0) > 15 && map.setZoom(15))
  }, [map, points, fitKey, focus])
  return null
}

export default function GoogleFleetMap({ vehicles, fitKey, focusId, routeLines, onOpen, onFail }: Props) {
  const placed = useMemo(() => vehicles.filter((v) => v.lat != null && v.lng != null), [vehicles])
  const points = useMemo(() => placed.map((v) => ({ lat: v.lat!, lng: v.lng! })), [placed])
  const f = placed.find((v) => v.id === focusId)
  const focus = useMemo(() => (f ? { lat: f.lat!, lng: f.lng! } : undefined), [f?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="absolute inset-0 isolate z-0 overflow-hidden rounded-2xl border border-line max-md:rounded-none max-md:border-0">
      <GoogleShell onFail={onFail} defaultCenter={{ lat: 42.3601, lng: -71.0589 }} defaultZoom={11}>
        {routeLines?.lines.map((l, i) => (
          <GPolyline key={i} path={l} strokeColor={routeLines.color} strokeOpacity={0.35} strokeWeight={4} clickable={false} />
        ))}
        {placed.map((v) => (
          <AdvancedMarker
            key={v.id}
            position={{ lat: v.lat!, lng: v.lng! }}
            title={`Kendaraan ${v.label}${v.route ? `, ${v.route.name}` : ''}`}
            onClick={() => onOpen(v.id)}
          >
            <Pin html={pinHtml(v.route?.color ?? FALLBACK.color, v.route?.textColor ?? FALLBACK.text, v.bearing, isStale(v.updatedAt))} />
          </AdvancedMarker>
        ))}
        <Camera points={points} fitKey={fitKey} focus={focus} />
      </GoogleShell>
    </div>
  )
}
