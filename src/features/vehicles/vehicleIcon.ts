import L from 'leaflet'

// A DivIcon avoids Leaflet's default PNG icon, whose URLs break once Vite hashes the assets.
export function vehicleIcon(color: string, textColor: string, bearing: number | null, stale = false) {
  const arrow =
    bearing == null
      ? ''
      : `<svg viewBox="0 0 24 24" width="18" height="18" style="transform:rotate(${bearing}deg)" fill="${textColor}"><path d="M12 3l6 15-6-3-6 3z"/></svg>`
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:${color};border:2px ${stale ? 'dashed #6B7280' : 'solid #fff'};box-shadow:0 1px 4px rgba(0,0,0,.4);${stale ? 'opacity:.55;filter:grayscale(.7);' : ''}display:flex;align-items:center;justify-content:center">${arrow || `<span style="width:8px;height:8px;border-radius:9999px;background:${textColor}"></span>`}</div>`,
  })
}
