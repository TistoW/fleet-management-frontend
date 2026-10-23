/**
 * Trips belong to a route. When a route is unselected, the trips of that route
 * leave the selection too. Trips whose route is not known yet are kept until hydrated.
 */
export function pruneTrips(
  trips: string[],
  routes: string[],
  routeOf: (tripId: string) => string | null | undefined,
): { kept: string[]; removed: string[] } {
  const kept: string[] = []
  const removed: string[] = []
  for (const id of trips) {
    const r = routeOf(id)
    ;(routes.length === 0 || (r && !routes.includes(r)) ? removed : kept).push(id)
  }
  return { kept, removed }
}
