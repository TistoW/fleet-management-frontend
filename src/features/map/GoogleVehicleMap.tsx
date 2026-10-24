import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { pinHtml } from '../vehicles/pin'
import { GoogleShell, Pin } from './GoogleShell'

interface Props {
  lat: number
  lng: number
  bearing: number | null
  color: string
  textColor: string
  label: string
  stop?: { lat: number; lng: number; name: string }
  onFail: () => void
}

/** Keeps the vehicle in view when a refresh moves it. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => map?.panTo({ lat, lng }), [map, lat, lng])
  return null
}

export default function GoogleVehicleMap({ lat, lng, bearing, color, textColor, label, stop, onFail }: Props) {
  return (
    <div className="relative isolate z-0 h-full min-h-64 overflow-hidden rounded-lg border border-line">
      <GoogleShell onFail={onFail} defaultCenter={{ lat, lng }} defaultZoom={15}>
        {stop && (
          <AdvancedMarker position={{ lat: stop.lat, lng: stop.lng }} title={stop.name}>
            <div style={{ transform: 'translateY(50%)', width: 12, height: 12, borderRadius: 9999, background: '#fff', border: '2px solid #17201D' }} />
          </AdvancedMarker>
        )}
        <AdvancedMarker position={{ lat, lng }} title={`Kendaraan ${label}`}>
          <Pin html={pinHtml(color, textColor, bearing)} />
        </AdvancedMarker>
        <Recenter lat={lat} lng={lng} />
      </GoogleShell>
    </div>
  )
}
