import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'

interface Props {
  lat: number
  lng: number
  bearing: number | null
  color: string
  textColor: string
  label: string
  stop?: { lat: number; lng: number; name: string }
}

/**
 * The map mounts before the dialog has its final size (lazy chunk + showModal), which leaves most
 * tiles grey. Re-measure on every container resize and keep the vehicle centered afterwards.
 */
function FitContainer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    const refit = () => {
      map.invalidateSize()
      map.setView([lat, lng], map.getZoom(), { animate: false })
    }
    const raf = requestAnimationFrame(refit)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refit)
    ro?.observe(map.getContainer())
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [map, lat, lng])
  return null
}

/** Keeps the vehicle in view when a refresh moves it. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.panTo([lat, lng])
  }, [map, lat, lng])
  return null
}

// A DivIcon avoids Leaflet's default PNG icon, whose URLs break once Vite hashes the assets.
function vehicleIcon(color: string, textColor: string, bearing: number | null) {
  const arrow =
    bearing == null
      ? ''
      : `<svg viewBox="0 0 24 24" width="18" height="18" style="transform:rotate(${bearing}deg)" fill="${textColor}"><path d="M12 3l6 15-6-3-6 3z"/></svg>`
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">${arrow || `<span style="width:8px;height:8px;border-radius:9999px;background:${textColor}"></span>`}</div>`,
  })
}

export default function VehicleMap({ lat, lng, bearing, color, textColor, label, stop }: Props) {
  const [tileFailed, setTileFailed] = useState(false)
  const icon = useMemo(() => vehicleIcon(color, textColor, bearing), [color, textColor, bearing])

  return (
    <div className="relative h-full min-h-64 overflow-hidden rounded-lg border border-line">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full min-h-64 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileFailed(true), tileload: () => setTileFailed(false) }}
        />
        {stop && (
          <CircleMarker center={[stop.lat, stop.lng]} radius={6} pathOptions={{ color: '#17201D', fillColor: '#fff', fillOpacity: 1 }}>
            <Tooltip>{stop.name}</Tooltip>
          </CircleMarker>
        )}
        <Marker position={[lat, lng]} icon={icon} title={`Kendaraan ${label}`} />
        <FitContainer lat={lat} lng={lng} />
        <Recenter lat={lat} lng={lng} />
      </MapContainer>
      {tileFailed && (
        <p role="status" className="absolute inset-x-2 bottom-8 z-[1000] rounded-md bg-paper/95 px-3 py-2 text-xs text-ink-muted shadow-sm">
          Gambar peta gagal dimuat. Koordinat kendaraan tetap tertera di samping.
        </p>
      )}
    </div>
  )
}
