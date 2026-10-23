import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchVehicles, type VehicleFilter } from '../api/vehicles'

export const REFRESH_MS = 30_000

/** `refetchInterval` already pauses while the tab is hidden (refetchIntervalInBackground defaults to false). */
export function useVehicles(filter: VehicleFilter, autoRefresh = false) {
  const routes = [...(filter.routes ?? [])].sort()
  const trips = [...(filter.trips ?? [])].sort()
  return useQuery({
    queryKey: ['vehicles', routes, trips],
    queryFn: ({ signal }) => fetchVehicles({ routes, trips }, signal),
    placeholderData: keepPreviousData,
    refetchInterval: autoRefresh ? REFRESH_MS : false,
  })
}
