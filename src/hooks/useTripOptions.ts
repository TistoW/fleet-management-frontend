import { keepPreviousData, useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { serviceDate } from '../lib/serviceDate'
import { fetchFirstDepartures, fetchTripsByIds, fetchTripsPage, type TripView } from '../api/trips'

const MAX_LABEL_IDS = 100

/**
 * - `all`: every trip scheduled today for the selected routes (50 per request). /trips needs a route filter.
 * - `named`: trips by id, for the ones running right now and the ones that only exist in the URL.
 */
export function useTripOptions(routes: string[], runningIds: string[], selectedIds: string[]) {
  const sortedRoutes = [...routes].sort()
  const date = serviceDate()
  const all = useInfiniteQuery({
    queryKey: ['trips', sortedRoutes, date],
    queryFn: ({ pageParam, signal }) => fetchTripsPage(sortedRoutes, pageParam, date, signal),
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
  // One schedules request per loaded trip page. A failure just means no times (no error UI).
  const timeQueries = useQueries({
    queries: (all.data?.pages ?? []).map((p) => {
      const pageIds = p.items.map((t) => t.id)
      return {
        queryKey: ['tripTimes', pageIds, date],
        queryFn: ({ signal }: { signal: AbortSignal }) => fetchFirstDepartures(pageIds, date, signal),
        staleTime: 5 * 60_000,
        retry: false,
      }
    }),
  })
  const times = useMemo(
    () => Object.assign({}, ...timeQueries.map((q) => q.data ?? {})) as Record<string, string>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeQueries.map((q) => q.dataUpdatedAt).join()],
  )
  return { all, named, allTrips, namedTrips: named.data ?? [], times }
}
