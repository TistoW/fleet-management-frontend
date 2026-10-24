import { decodePolyline, type LatLng } from '../lib/geo'
import type { Resource, StopAttrs } from '../types/mbta'
import { apiGet } from './client'
import { indexIncluded, relId } from './jsonapi'

export interface UpcomingStop {
  id: string
  name: string
  lat: number | null
  lng: number | null
  /** ISO time the vehicle arrives (or departs, at the first stop). */
  at: string
  /** `prediction` is live; `schedule` is the timetable fallback. */
  kind: 'prediction' | 'schedule'
}

type Timed = { arrival_time: string | null; departure_time: string | null; stop_sequence: number }
type Shape = Resource<{ polyline: string }>

/** The trip's own shape, one request. Never changes for a trip, so callers cache it forever. */
export async function fetchTripShape(tripId: string, signal?: AbortSignal): Promise<LatLng[]> {
  const doc = await apiGet<unknown>(`/trips/${encodeURIComponent(tripId)}`, { include: 'shape', 'fields[shape]': 'polyline', 'fields[trip]': 'headsign' }, signal)
  const shape = (doc.included ?? []).find((r): r is Shape => r.type === 'shape')
  return shape ? decodePolyline(shape.attributes.polyline) : []
}

/** Every shape of a route (both directions, branches). */
export async function fetchRouteShapes(routeId: string, signal?: AbortSignal): Promise<LatLng[][]> {
  const doc = await apiGet<Shape[]>('/shapes', { 'filter[route]': routeId, 'fields[shape]': 'polyline' }, signal)
  return doc.data.map((s) => decodePolyline(s.attributes.polyline))
}

async function fetchTimed(kind: 'predictions' | 'schedules', tripId: string, signal?: AbortSignal): Promise<UpcomingStop[]> {
  const one = kind === 'predictions' ? 'prediction' : 'schedule'
  const doc = await apiGet<Resource<Timed>[]>(
    `/${kind}`,
    {
      'filter[trip]': tripId,
      include: 'stop',
      sort: 'stop_sequence',
      [`fields[${one}]`]: 'arrival_time,departure_time,stop_sequence',
      'fields[stop]': 'name,latitude,longitude',
    },
    signal,
  )
  const index = indexIncluded(doc.included)
  const out: UpcomingStop[] = []
  for (const r of doc.data) {
    const at = r.attributes.arrival_time ?? r.attributes.departure_time
    const stopId = relId(r, 'stop')
    const stop = stopId ? (index.get(`stop:${stopId}`) as Resource<StopAttrs> | undefined) : undefined
    if (!at || !stop) continue
    out.push({ id: stop.id, name: stop.attributes.name, lat: stop.attributes.latitude, lng: stop.attributes.longitude, at, kind: one })
  }
  return out
}

/** Live predictions; if there are none, the timetable for the same trip (a second request only then). */
export async function fetchUpcoming(tripId: string, signal?: AbortSignal): Promise<UpcomingStop[]> {
  const live = await fetchTimed('predictions', tripId, signal)
  return live.length > 0 ? live : fetchTimed('schedules', tripId, signal)
}
