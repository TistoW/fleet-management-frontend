import L from 'leaflet'
import { pinHtml } from './pin'

// A DivIcon avoids Leaflet's default PNG icon, whose URLs break once Vite hashes the assets.
export function vehicleIcon(color: string, textColor: string, bearing: number | null, stale = false) {
  return L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: pinHtml(color, textColor, bearing, stale) })
}
