export interface ResourceId {
  id: string
  type: string
}

export interface Relationship {
  data: ResourceId | null
}

export interface Resource<A> {
  id: string
  type: string
  attributes: A
  relationships?: Record<string, Relationship>
}

export interface VehicleAttrs {
  bearing: number | null
  carriages: { label: string; occupancy_status: string | null; occupancy_percentage: number | null }[]
  current_status: string | null
  current_stop_sequence: number | null
  direction_id: number | null
  label: string | null
  latitude: number | null
  longitude: number | null
  occupancy_status: string | null
  revenue: string
  speed: number | null
  updated_at: string
}

export interface RouteAttrs {
  short_name: string
  long_name: string
  color: string
  text_color: string
  type: number
  description: string
  direction_names: string[]
  direction_destinations: string[]
}

export interface TripAttrs {
  headsign: string
  direction_id: number
  block_id: string
  name: string
  wheelchair_accessible: number
  bikes_allowed: number
}

export interface StopAttrs {
  name: string
  platform_name: string | null
  latitude: number | null
  longitude: number | null
}

export type Vehicle = Resource<VehicleAttrs>
export type Route = Resource<RouteAttrs>
export type Trip = Resource<TripAttrs>
export type Stop = Resource<StopAttrs>

export interface JsonApiLinks {
  first?: string
  prev?: string
  next?: string
  last?: string
}

/** `links` is absent when `data` is empty (verified against the live API). */
export interface JsonApiDoc<T> {
  data: T
  included?: Resource<unknown>[]
  links?: JsonApiLinks
}

export interface JsonApiError {
  code?: string
  status?: string
  title?: string
  detail?: string
  source?: { parameter?: string }
}
