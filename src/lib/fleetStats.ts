import type { VehicleView } from '../api/vehicles'
import type { StatusFilter } from '../hooks/useUrlState'
import { statusInfo } from './status'

export interface FleetStats {
  total: number
  berjalan: number
  berhenti: number
  routes: number
}

/** Counts for the stat cards, taken from the vehicles already loaded (no extra request). */
export function fleetStats(vehicles: VehicleView[]): FleetStats {
  const routes = new Set<string>()
  let berjalan = 0
  let berhenti = 0
  for (const v of vehicles) {
    const g = statusInfo(v.status).group
    if (g === 'berjalan') berjalan++
    else if (g === 'berhenti') berhenti++
    if (v.route) routes.add(v.route.id)
  }
  return { total: vehicles.length, berjalan, berhenti, routes: routes.size }
}

export const applyStatus = (vehicles: VehicleView[], status: StatusFilter | null) =>
  status ? vehicles.filter((v) => statusInfo(v.status).group === status) : vehicles

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  berjalan: 'Sedang berjalan',
  berhenti: 'Berhenti di halte',
}
