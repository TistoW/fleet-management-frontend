import { useQuery } from '@tanstack/react-query'
import { fetchRouteShapes, fetchTripShape, fetchUpcoming } from '../api/journey'
import { REFRESH_MS } from './useVehicles'

// All three are decoration: no retries (20 requests/min limit) and no error UI. A failure just means no line.

export function useTripShape(tripId: string | null | undefined) {
  return useQuery({
    queryKey: ['shape', tripId],
    queryFn: ({ signal }) => fetchTripShape(tripId!, signal),
    enabled: !!tripId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
}

export function useUpcoming(tripId: string | null | undefined, autoRefresh = false) {
  return useQuery({
    queryKey: ['upcoming', tripId],
    queryFn: ({ signal }) => fetchUpcoming(tripId!, signal),
    enabled: !!tripId,
    staleTime: 15_000,
    refetchInterval: autoRefresh ? REFRESH_MS : false,
    // Drop stops the vehicle has already left (a refresh can lag behind the clock).
    select: (all) => all.filter((s) => Date.parse(s.at) > Date.now() - 30_000),
    retry: false,
  })
}

export function useRouteShapes(routeId: string | null | undefined) {
  return useQuery({
    queryKey: ['route-shapes', routeId],
    queryFn: ({ signal }) => fetchRouteShapes(routeId!, signal),
    enabled: !!routeId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
}
