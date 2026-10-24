import type { VehicleView } from '../api/vehicles'

const norm = (s: string) => s.toLocaleLowerCase('id')

/** Words of the query must all appear somewhere in the label, id, route names, destination or stop. */
export function matchesQuery(v: VehicleView, query: string): boolean {
  const words = norm(query).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const hay = norm([v.label, v.id, v.route?.name, v.route?.longName, v.headsign, v.stopName].filter(Boolean).join(' '))
  return words.every((w) => hay.includes(w))
}

export const applySearch = (vehicles: VehicleView[], query: string) =>
  query.trim() ? vehicles.filter((v) => matchesQuery(v, query)) : vehicles
