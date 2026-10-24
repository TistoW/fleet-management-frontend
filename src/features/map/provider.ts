import { useCallback, useState } from 'react'

export type Provider = 'osm' | 'google'
const STORE = 'map-provider'

export const googleKey = () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || undefined

/** OSM unless a key exists AND the user chose Google earlier. */
export const initialProvider = (key: string | undefined, stored: string | null): Provider => (key && stored === 'google' ? 'google' : 'osm')

function read() {
  try {
    return localStorage.getItem(STORE)
  } catch {
    return null
  }
}

export function useMapProvider() {
  const [provider, set] = useState<Provider>(() => initialProvider(googleKey(), read()))
  const [failed, setFailed] = useState(false)
  const choose = useCallback((p: Provider) => {
    set(p)
    setFailed(false)
    try {
      localStorage.setItem(STORE, p)
    } catch {
      /* private mode: the choice just is not remembered */
    }
  }, [])
  const fail = useCallback(() => {
    choose('osm')
    setFailed(true)
  }, [choose])
  return { provider, choose, fail, failed, canSwitch: !!googleKey() }
}
