import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchTripsByIds, fetchTripsPage, type TripView } from '../api/trips'

const MAX_LABEL_IDS = 100

/**
 * - `all`: every trip scheduled today for the selected routes (50 per request). /trips needs a route filter.
 * - `named`: trips by id, for the ones running right now and the ones that only exist in the URL.
 */
export function useTripOptions(routes: string[], runningIds: string[], selectedIds: string[]) {
  const sortedRoutes = [...routes].sort()
  const all = useInfiniteQuery({
    queryKey: ['trips', sortedRoutes],
    queryFn: ({ pageParam, signal }) => fetchTripsPage(sortedRoutes, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    enabled: routes.length > 0,
    staleTime: 5 * 60_000,
  })
  const ids = [...new Set([...selectedIds, ...runningIds])].sort().slice(0, MAX_LABEL_IDS)
  const named = useQuery({
    queryKey: ['tripsById', ids],
    queryFn: ({ signal }) => fetchTripsByIds(ids, signal),
    enabled: routes.length > 0 && ids.length > 0,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })
  const allTrips = useMemo<TripView[]>(() => all.data?.pages.flatMap((p) => p.items) ?? [], [all.data])
  return { all, named, allTrips, namedTrips: named.data ?? [] }
}
