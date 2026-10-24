/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MBTA_API_KEY?: string
  /** Optional. Without it the map stays on OpenStreetMap and the Google switch is hidden. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}
