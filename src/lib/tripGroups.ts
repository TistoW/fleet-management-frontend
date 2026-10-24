import type { TripView } from '../api/trips'

export const RUNNING = 'Sedang berjalan'
export const OTHER = 'Jadwal lain hari ini'

export interface TripEntry {
  trip: TripView
  running: boolean
  /** ISO departure from the first stop, when known. */
  time?: string
  /** Label of the vehicle that runs the trip right now. */
  vehicle?: string
}

/** Running trips first (as loaded), then the remaining schedule sorted by departure; trips without a time go last in loaded order. */
export function groupTrips(
  runningTrips: TripView[],
  allTrips: TripView[],
  vehicleByTrip: Map<string, string>,
  times: Record<string, string>,
): TripEntry[] {
  const live = runningTrips.filter((t) => vehicleByTrip.has(t.id))
  const liveIds = new Set(live.map((t) => t.id))
  const toEntry = (trip: TripView, running: boolean): TripEntry => ({ trip, running, time: times[trip.id], vehicle: vehicleByTrip.get(trip.id) })
  const other = allTrips.filter((t) => !liveIds.has(t.id)).map((t) => toEntry(t, false))
  const at = (e: TripEntry) => (e.time ? new Date(e.time).getTime() : Infinity)
  // Array.prototype.sort is stable, so ties and missing times keep the loaded order.
  other.sort((a, b) => at(a) - at(b))
  return [...live.map((t) => toEntry(t, true)), ...other]
}

export function tripSummary(entries: TripEntry[], hasMore: boolean): string {
  const running = entries.filter((e) => e.running).length
  const schedule = entries.length - running
  return `${running} sedang berjalan · ${schedule}${hasMore ? '+' : ''} jadwal`
}
