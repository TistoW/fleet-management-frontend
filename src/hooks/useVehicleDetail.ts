import { useQuery } from '@tanstack/react-query'
import { fetchVehicleDetail } from '../api/vehicles'
import { REFRESH_MS } from './useVehicles'

export function useVehicleDetail(id: string, autoRefresh = false) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: ({ signal }) => fetchVehicleDetail(id, signal),
    staleTime: 15_000,
    refetchInterval: autoRefresh ? REFRESH_MS : false,
  })
}
