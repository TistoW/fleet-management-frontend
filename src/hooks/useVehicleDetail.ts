import { useQuery } from '@tanstack/react-query'
import { fetchVehicleDetail } from '../api/vehicles'

export function useVehicleDetail(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: ({ signal }) => fetchVehicleDetail(id, signal),
    staleTime: 15_000,
  })
}
