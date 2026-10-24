import { getSimulation } from './simulate'

/** Reverse geocoding for the detail popup only: Photon first, Nominatim as fallback (both OpenStreetMap data). */

interface PhotonDoc {
  features?: { properties?: Record<string, string | undefined> }[]
}
interface NominatimDoc {
  address?: Record<string, string | undefined>
}

const join = (...parts: (string | undefined)[]) => {
  const seen = parts.filter((p, i): p is string => !!p && parts.indexOf(p) === i)
  return seen.length ? seen.join(', ') : null
}

export function fromPhoton(doc: PhotonDoc): string | null {
  const p = doc.features?.[0]?.properties
  if (!p) return null
  return join(p.street ?? p.name, p.district ?? p.locality ?? p.city)
}

export function fromNominatim(doc: NominatimDoc): string | null {
  const a = doc.address
  if (!a) return null
  return join(a.road ?? a.pedestrian ?? a.footway, a.suburb ?? a.neighbourhood ?? a.city ?? a.town ?? a.village)
}

async function getJson<T>(url: string, signal?: AbortSignal, headers?: Record<string, string>): Promise<T> {
  if (getSimulation() === 'geocode-fail') throw new Error('503')
  const res = await fetch(url, { signal, headers })
  if (!res.ok) throw new Error(String(res.status))
  return (await res.json()) as T
}

/** One request normally; the second only when Photon fails or knows nothing. Never throws except on abort. */
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const name = fromPhoton(await getJson<PhotonDoc>(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=en`, signal))
    if (name) return name
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
  }
  try {
    return fromNominatim(
      await getJson<NominatimDoc>(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17`, signal, {
        'Accept-Language': 'id',
      }),
    )
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    return null
  }
}
