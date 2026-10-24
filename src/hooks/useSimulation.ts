import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useSyncExternalStore } from 'react'
import { getSimulation, setSimulation, subscribeSimulation, type SimMode } from '../api/simulate'

export const useSimulation = () => useSyncExternalStore(subscribeSimulation, getSimulation, () => null)

/** Switches a mode on or off and drops cached data, so the page refetches and shows the result at once. */
export function useSetSimulation() {
  const qc = useQueryClient()
  return useCallback(
    (mode: SimMode | null) => {
      setSimulation(mode)
      void qc.resetQueries()
    },
    [qc],
  )
}
