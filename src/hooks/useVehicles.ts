import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchVehicles, type VehicleFilter } from '../api/vehicles'

export function useVehicles(filter: VehicleFilter) {
  const routes = [...(filter.routes ?? [])].sort()
  const trips = [...(filter.trips ?? [])].sort()
  return useQuery({
    queryKey: ['vehicles', routes, trips],
    queryFn: ({ signal }) => fetchVehicles({ routes, trips }, signal),
    placeholderData: keepPreviousData,
  })
}
