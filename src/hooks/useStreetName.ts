import { useQuery } from '@tanstack/react-query'
import { reverseGeocode } from '../api/geocode'

/** About 110 m: the 30 s detail refresh reuses the answer until the vehicle really moves. */
const round = (n: number) => Math.round(n * 1000) / 1000

export function useStreetName(lat: number | null | undefined, lng: number | null | undefined) {
  const has = lat != null && lng != null
  const la = has ? round(lat) : 0
  const lo = has ? round(lng) : 0
  return useQuery({
    queryKey: ['street', la, lo],
    queryFn: ({ signal }) => reverseGeocode(la, lo, signal),
    enabled: has,
    staleTime: Infinity,
    retry: false,
  })
}
