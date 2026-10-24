import type { Trip } from '../types/mbta'
import { apiGet } from './client'
import { offsetFromLink, relId } from './jsonapi'
import type { Page } from './routes'

export interface TripView {
  id: string
  headsign: string
  directionId: number
  blockId: string
  name: string
  wheelchair: number
  bikes: number
  routeId: string | null
}

export const TRIP_PAGE_SIZE = 50

export function toTripView(t: Pick<Trip, 'id' | 'relationships'> & { attributes: Partial<Trip['attributes']> }): TripView {
  const a = t.attributes
  return {
    id: t.id,
    headsign: a.headsign ?? '',
    directionId: a.direction_id ?? 0,
    blockId: a.block_id ?? '',
    name: a.name ?? '',
    wheelchair: a.wheelchair_accessible ?? 0,
    bikes: a.bikes_allowed ?? 0,
    routeId: relId(t as Trip, 'route'),
  }
}

const FIELDS = 'headsign,direction_id,block_id,name'

/** /trips rejects requests without a filter (400), so at least one route is required. */
export async function fetchTripsPage(
  routeIds: string[],
  offset: number,
  signal?: AbortSignal,
): Promise<Page<TripView>> {
  const doc = await apiGet<Trip[]>(
    '/trips',
    {
      'filter[route]': routeIds.join(','),
      'page[limit]': TRIP_PAGE_SIZE,
      'page[offset]': offset,
      'fields[trip]': FIELDS,
    },
    signal,
  )
  return { items: doc.data.map(toTripView), nextOffset: offsetFromLink(doc.links?.next) }
}

/** Restores label and route of trips that only exist as ids in the URL. */
export async function fetchTripsByIds(ids: string[], signal?: AbortSignal): Promise<TripView[]> {
  if (!ids.length) return []
  const doc = await apiGet<Trip[]>(
    '/trips',
    { 'filter[id]': ids.join(','), 'fields[trip]': FIELDS },
    signal,
  )
  return doc.data.map(toTripView)
}

/** First-stop departure per trip id (ISO), one request for a whole trip page. Trips without a schedule are absent. */
export async function fetchFirstDepartures(ids: string[], signal?: AbortSignal): Promise<Record<string, string>> {
  if (!ids.length) return {}
  const doc = await apiGet<
    { attributes: { departure_time: string | null; arrival_time: string | null }; relationships: { trip?: { data?: { id: string } | null } } }[]
  >(
    '/schedules',
    {
      'filter[trip]': ids.join(','),
      'filter[stop_sequence]': 'first',
      'fields[schedule]': 'departure_time,arrival_time',
    },
    signal,
  )
  const out: Record<string, string> = {}
  for (const s of doc.data) {
    const id = s.relationships.trip?.data?.id
    const t = s.attributes.departure_time ?? s.attributes.arrival_time
    if (id && t) out[id] = t
  }
  return out
}
