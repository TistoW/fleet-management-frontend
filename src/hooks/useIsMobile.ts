import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 767px)'

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia?.(QUERY)
  mq?.addEventListener?.('change', cb)
  return () => mq?.removeEventListener?.('change', cb)
}

/** Phones and small tablets (below Tailwind's md). Without matchMedia (tests) it is false. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(QUERY).matches ?? false,
    () => false,
  )
}
