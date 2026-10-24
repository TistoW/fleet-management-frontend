export type LatLng = [number, number]

/** What the detail map draws on top of the vehicle: the line split at the vehicle, plus the stops still ahead (last = destination). */
export interface Journey {
  passed: LatLng[]
  ahead: LatLng[]
  stops: { lat: number; lng: number; name: string }[]
  /** Changes once per trip when the line is ready; the map frames the route only then. */
  frameKey: string
}

/** Solar "flag-bold" inlined for map markers that cannot render React icons. */
export const FLAG_SVG = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M5.75 1C6.16421 1 6.5 1.33579 6.5 1.75V3.6L8.22067 3.25587C9.8712 2.92576 11.5821 3.08284 13.1449 3.70797L13.3486 3.78943C14.9097 4.41389 16.628 4.53051 18.2592 4.1227C19.0165 3.93339 19.75 4.50613 19.75 5.28669V12.6537C19.75 13.298 19.3115 13.8596 18.6864 14.0159L18.472 14.0695C16.7024 14.5119 14.8385 14.3854 13.1449 13.708C11.5821 13.0828 9.8712 12.9258 8.22067 13.2559L6.5 13.6V21.75C6.5 22.1642 6.16421 22.5 5.75 22.5C5.33579 22.5 5 22.1642 5 21.75V1.75C5 1.33579 5.33579 1 5.75 1Z"/></svg>'

/** Google encoded polyline (precision 5), the format MBTA shapes use. */
export function decodePolyline(encoded: string): LatLng[] {
  const out: LatLng[] = []
  let i = 0
  let lat = 0
  let lng = 0
  const next = () => {
    let result = 0
    let shift = 0
    let b: number
    do {
      b = encoded.charCodeAt(i++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20 && i < encoded.length)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (i < encoded.length) {
    lat += next()
    lng += next()
    out.push([lat / 1e5, lng / 1e5])
  }
  return out
}

/**
 * Splits a line at the point closest to `p`: `passed` ends there, `ahead` starts there.
 * ponytail: nearest segment overall, so a line that loops back near itself can snap to the wrong lap; search forward from the last split if that shows up.
 */
export function splitAtClosest(line: LatLng[], p: LatLng): { passed: LatLng[]; ahead: LatLng[] } {
  if (line.length < 2) return { passed: [], ahead: line }
  const k = Math.cos((p[0] * Math.PI) / 180)
  let best = { d: Infinity, i: 0, pt: line[0] }
  for (let i = 0; i < line.length - 1; i++) {
    const [ay, ax] = line[i]
    const [by, bx] = line[i + 1]
    const dx = (bx - ax) * k
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[1] - ax) * k * dx + (p[0] - ay) * dy) / len2))
    const pt: LatLng = [ay + dy * t, ax + (bx - ax) * t]
    const d = ((p[1] - pt[1]) * k) ** 2 + (p[0] - pt[0]) ** 2
    if (d < best.d) best = { d, i, pt }
  }
  return { passed: [...line.slice(0, best.i + 1), best.pt], ahead: [best.pt, ...line.slice(best.i + 1)] }
}
