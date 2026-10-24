import { useState } from 'react'
import type { View, UrlState } from './useUrlState'
import { useRateLimitRetry } from './useRateLimitRetry'
import { useUrlState } from './useUrlState'
import { useVehicles } from './useVehicles'

export type SetUrl = ReturnType<typeof useUrlState>[1]
export type { UrlState, View }

/**
 * One vehicles query for the whole app: the cards and the map read the same cache entry, so
 * switching view never costs a request. The query is off on the data page, which shows no vehicles.
 */
export function useFleet() {
  const [url, setUrl] = useUrlState()
  const [auto, setAuto] = useState(true)
  const q = useVehicles({ routes: url.routes, trips: url.trips }, auto, url.view !== 'data' && url.view !== 'simulasi')
  const countdown = useRateLimitRetry(q.error, () => void q.refetch())
  return { url, setUrl, auto, setAuto, fleet: { ...q, countdown } }
}

export type FleetQuery = ReturnType<typeof useFleet>['fleet']
