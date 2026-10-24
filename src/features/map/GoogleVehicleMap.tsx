import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import type { Journey } from '../../lib/geo'
import { destinationHtml, pinHtml } from '../vehicles/pin'
import { GoogleShell, GPolyline, Pin } from './GoogleShell'

interface Props {
  lat: number
  lng: number
  bearing: number | null
  color: string
  textColor: string
  label: string
  stop?: { lat: number; lng: number; name: string }
  journey?: Journey
  onFail: () => void
}

/** Keeps the vehicle in view when a refresh moves it. */
function Recenter({ lat, lng, off }: { lat: number; lng: number; off: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!off) map?.panTo({ lat, lng })
  }, [map, lat, lng, off])
  return null
}

/** Fits the remaining route plus the vehicle once per trip. */
function Frame({ journey, lat, lng }: { journey?: Journey; lat: number; lng: number }) {
  const map = useMap()
  const done = useRef<string | null>(null)
  useEffect(() => {
    if (!map || !journey || done.current === journey.frameKey) return
    done.current = journey.frameKey
    const b = new google.maps.LatLngBounds({ lat, lng })
    ;(journey.ahead.length > 1 ? journey.ahead : journey.passed).forEach(([la, ln]) => b.extend({ lat: la, lng: ln }))
    map.fitBounds(b, 30)
  }, [map, journey, lat, lng])
  return null
}

export default function GoogleVehicleMap({ lat, lng, bearing, color, textColor, label, stop, journey, onFail }: Props) {
  return (
    <div className="relative isolate z-0 h-full min-h-64 overflow-hidden rounded-lg border border-line">
      <GoogleShell onFail={onFail} defaultCenter={{ lat, lng }} defaultZoom={15}>
        {journey && (
          <>
            <GPolyline path={journey.passed} strokeColor={color} strokeOpacity={0.3} strokeWeight={4} />
            <GPolyline path={journey.ahead} strokeColor={color} strokeOpacity={0.9} strokeWeight={5} />
            {journey.stops.slice(0, -1).map((s) => (
              <AdvancedMarker key={`${s.name}-${s.lat}`} position={s} title={s.name}>
                <div style={{ transform: 'translateY(50%)', width: 9, height: 9, borderRadius: 9999, background: '#fff', border: `2px solid ${color}` }} />
              </AdvancedMarker>
            ))}
            {journey.stops.length > 0 && (
              <AdvancedMarker position={journey.stops[journey.stops.length - 1]} title={`Tujuan: ${journey.stops[journey.stops.length - 1].name}`}>
                <Pin html={destinationHtml(color)} />
              </AdvancedMarker>
            )}
          </>
        )}
        {stop && (
          <AdvancedMarker position={{ lat: stop.lat, lng: stop.lng }} title={stop.name}>
            <div style={{ transform: 'translateY(50%)', width: 12, height: 12, borderRadius: 9999, background: '#fff', border: '2px solid #17201D' }} />
          </AdvancedMarker>
        )}
        <AdvancedMarker position={{ lat, lng }} title={`Kendaraan ${label}`}>
          <Pin html={pinHtml(color, textColor, bearing)} />
        </AdvancedMarker>
        <Frame journey={journey} lat={lat} lng={lng} />
        <Recenter lat={lat} lng={lng} off={!!journey} />
      </GoogleShell>
    </div>
  )
}
