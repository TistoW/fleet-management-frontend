import type { Route, Stop, Trip, Vehicle } from '../types/mbta'
import { apiGet } from './client'
import { indexIncluded, pickIncluded, relId } from './jsonapi'
import { toRouteView, type RouteView } from './routes'
import { toTripView, type TripView } from './trips'

export interface VehicleView {
  id: string
  label: string
  status: string | null
  lat: number | null
  lng: number | null
  updatedAt: string
  directionId: number | null
  bearing: number | null
  occupancy: string | null
  routeId: string | null
  tripId: string | null
  /** Destination of the current trip, when the list request included it. */
  headsign?: string | null
  /** Stop the vehicle is at or heading to, from the same list request. */
  stopName?: string | null
  route?: RouteView
}

export interface StopView {
  id: string
  name: string
  platform: string | null
  lat: number | null
  lng: number | null
}

export interface VehicleDetail extends VehicleView {
  speed: number | null
  bearing: number | null
  stopId: string | null
  trip?: TripView
  stop?: StopView
  carriages: Vehicle['attributes']['carriages']
}

export interface VehicleFilter {
  routes?: string[]
  trips?: string[]
}

function toView(v: Vehicle, route?: Route, trip?: Trip, stop?: Stop): VehicleView {
  const a = v.attributes
  return {
    id: v.id,
    label: a.label ?? v.id,
    status: a.current_status,
    lat: a.latitude,
    lng: a.longitude,
    updatedAt: a.updated_at,
    directionId: a.direction_id,
    bearing: a.bearing ?? null,
    occupancy: a.occupancy_status,
    routeId: relId(v, 'route'),
    tripId: relId(v, 'trip'),
    headsign: trip?.attributes.headsign || null,
    stopName: stop?.attributes.name || null,
    route: route && toRouteView(route),
  }
}

// Pagination is client-side on purpose; switch to page[offset] with the total from links.last if the fleet passes ~5,000.
export async function fetchVehicles(
  filter: VehicleFilter = {},
  signal?: AbortSignal,
): Promise<VehicleView[]> {
  const doc = await apiGet<Vehicle[]>(
    '/vehicles',
    {
      'filter[route]': filter.routes?.join(','),
      'filter[trip]': filter.trips?.join(','),
      include: 'route,trip,stop',
      sort: 'label',
      'fields[vehicle]':
        'label,current_status,latitude,longitude,updated_at,direction_id,occupancy_status,bearing',
      'fields[route]': 'short_name,long_name,color,text_color,type',
      'fields[trip]': 'headsign',
      'fields[stop]': 'name',
    },
    signal,
  )
  const index = indexIncluded(doc.included)
  return doc.data.map((v) =>
    toView(v, pickIncluded<Route['attributes']>(index, 'route', relId(v, 'route')), pickIncluded<Trip['attributes']>(index, 'trip', relId(v, 'trip')), pickIncluded<Stop['attributes']>(index, 'stop', relId(v, 'stop'))),
  )
}

export async function fetchVehicleDetail(id: string, signal?: AbortSignal): Promise<VehicleDetail> {
  const doc = await apiGet<Vehicle>(
    `/vehicles/${encodeURIComponent(id)}`,
    { include: 'route,trip,stop' },
    signal,
  )
  const v = doc.data
  const index = indexIncluded(doc.included)
  const route = pickIncluded<Route['attributes']>(index, 'route', relId(v, 'route'))
  const trip = pickIncluded<Trip['attributes']>(index, 'trip', relId(v, 'trip'))
  const stop = pickIncluded<Stop['attributes']>(index, 'stop', relId(v, 'stop'))
  return {
    ...toView(v, route, trip),
    speed: v.attributes.speed,
    stopId: relId(v, 'stop'),
    carriages: v.attributes.carriages,
    trip: trip && toTripView(trip),
    stop: stop && {
      id: stop.id,
      name: stop.attributes.name,
      platform: stop.attributes.platform_name,
      lat: stop.attributes.latitude,
      lng: stop.attributes.longitude,
    },
  }
}
