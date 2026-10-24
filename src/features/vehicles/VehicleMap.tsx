import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Journey } from '../../lib/geo'
import { destinationHtml } from './pin'
import { vehicleIcon } from './vehicleIcon'

interface Props {
  lat: number
  lng: number
  bearing: number | null
  color: string
  textColor: string
  label: string
  stop?: { lat: number; lng: number; name: string }
  journey?: Journey
}

/**
 * The map mounts before the dialog has its final size (lazy chunk + showModal), which leaves most
 * tiles grey. Re-measure on every container resize and keep the vehicle centered afterwards.
 */
function FitContainer({ lat, lng, framed }: { lat: number; lng: number; framed: boolean }) {
  const map = useMap()
  useEffect(() => {
    const refit = () => {
      map.invalidateSize()
      if (!framed) map.setView([lat, lng], map.getZoom(), { animate: false })
    }
    const raf = requestAnimationFrame(refit)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refit)
    ro?.observe(map.getContainer())
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [map, lat, lng, framed])
  return null
}

/** Fits the remaining route plus the vehicle once per trip; later refreshes only move the split. */
function Frame({ journey, lat, lng }: { journey?: Journey; lat: number; lng: number }) {
  const map = useMap()
  const done = useRef<string | null>(null)
  useEffect(() => {
    if (!journey || done.current === journey.frameKey) return
    done.current = journey.frameKey
    map.fitBounds(L.latLngBounds([...(journey.ahead.length > 1 ? journey.ahead : journey.passed), [lat, lng]]), { padding: [30, 30], maxZoom: 16, animate: false })
  }, [map, journey, lat, lng])
  return null
}

/** Keeps the vehicle in view when a refresh moves it. */
function Recenter({ lat, lng, off }: { lat: number; lng: number; off: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!off) map.panTo([lat, lng])
  }, [map, lat, lng, off])
  return null
}

export default function VehicleMap({ lat, lng, bearing, color, textColor, label, stop, journey }: Props) {
  const [tileFailed, setTileFailed] = useState(false)
  const icon = useMemo(() => vehicleIcon(color, textColor, bearing), [color, textColor, bearing])
  const dest = journey?.stops.at(-1)
  const destIcon = useMemo(() => L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 13], html: destinationHtml(color) }), [color])

  return (
    <div className="relative isolate z-0 h-full min-h-64 overflow-hidden rounded-lg border border-line">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom wheelPxPerZoomLevel={80} className="h-full min-h-64 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileFailed(true), tileload: () => setTileFailed(false) }}
        />
        {journey && (
          <>
            <Polyline positions={journey.passed} pathOptions={{ color, weight: 4, opacity: 0.35, dashArray: journey.ahead.length > 1 ? '2 8' : undefined }} />
            <Polyline positions={journey.ahead} pathOptions={{ color, weight: 5, opacity: 0.9 }} />
            {journey.stops.slice(0, -1).map((s) => (
              <CircleMarker key={`${s.name}-${s.lat}`} center={[s.lat, s.lng]} radius={3.5} pathOptions={{ color, weight: 2, fillColor: '#fff', fillOpacity: 1 }}>
                <Tooltip>{s.name}</Tooltip>
              </CircleMarker>
            ))}
            {dest && (
              <Marker position={[dest.lat, dest.lng]} icon={destIcon} title={`Tujuan: ${dest.name}`}>
                <Tooltip>{dest.name}</Tooltip>
              </Marker>
            )}
          </>
        )}
        {stop && (
          <CircleMarker center={[stop.lat, stop.lng]} radius={6} pathOptions={{ color: '#17201D', fillColor: '#fff', fillOpacity: 1 }}>
            <Tooltip>{stop.name}</Tooltip>
          </CircleMarker>
        )}
        <Marker position={[lat, lng]} icon={icon} title={`Kendaraan ${label}`} />
        <FitContainer lat={lat} lng={lng} framed={!!journey} />
        <Frame journey={journey} lat={lat} lng={lng} />
        <Recenter lat={lat} lng={lng} off={!!journey} />
      </MapContainer>
      {tileFailed && (
        <p role="status" className="absolute inset-x-2 bottom-8 z-[1000] rounded-md bg-paper/95 px-3 py-2 text-xs text-ink-muted shadow-sm">
          Gambar peta gagal dimuat. Koordinat kendaraan tetap tertera di samping.
        </p>
      )}
    </div>
  )
}
