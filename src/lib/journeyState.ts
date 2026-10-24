import type { UpcomingStop } from '../api/journey'

export type JourneyState = 'loading' | 'no-trip' | 'unavailable' | 'terminus' | 'ok'

interface Input {
  tripId: string | null | undefined
  /** Shape and predictions have both finished (success or failure). */
  settled: boolean
  hasShape: boolean
  upcoming: UpcomingStop[]
}

/** Which message the "Perjalanan berikutnya" section shows. */
export function journeyState({ tripId, settled, hasShape, upcoming }: Input): JourneyState {
  if (!tripId) return 'no-trip'
  if (!settled) return 'loading'
  if (upcoming.length > 0) return 'ok'
  return hasShape ? 'terminus' : 'unavailable'
}

/** While stopped at a stop, its own arrival entry is not "next": drop it so the terminus is detected. */
export function remainingStops(all: UpcomingStop[], currentStopId: string | null, stopped: boolean): UpcomingStop[] {
  return stopped && currentStopId ? all.filter((s) => s.id !== currentStopId) : all
}
