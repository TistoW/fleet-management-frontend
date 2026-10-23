import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchRoutesPage, type RouteView } from '../api/routes'

/** All routes, 30 per request, following links.next. Routes do not change within a session. */
export function useRouteOptions() {
  const query = useInfiniteQuery({
    queryKey: ['routes'],
    queryFn: ({ pageParam, signal }) => fetchRoutesPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    staleTime: Infinity,
  })
  const routes = useMemo<RouteView[]>(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data])
  return { ...query, routes }
}
