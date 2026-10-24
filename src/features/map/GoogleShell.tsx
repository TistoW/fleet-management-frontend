import { APIProvider, Map, useMap, type MapProps } from '@vis.gl/react-google-maps'
import { useEffect, type ReactNode } from 'react'
import { googleKey } from './provider'

/** AdvancedMarker needs a Map ID; Google's demo one is enough for plain markers. */
export const MAP_ID = 'DEMO_MAP_ID'

/** Loads the Maps script (once, lazily) and reports key/referrer/script failures through onFail. */
export function GoogleShell({ onFail, children, ...map }: { onFail: () => void; children: ReactNode } & MapProps) {
  useEffect(() => {
    // Google calls this global when the key is rejected (RefererNotAllowed, ApiNotActivated, ...).
    const w = window as unknown as { gm_authFailure?: () => void }
    w.gm_authFailure = onFail
    return () => {
      delete w.gm_authFailure
    }
  }, [onFail])
  return (
    <APIProvider apiKey={googleKey() ?? ''} onError={onFail}>
      <Map
        mapId={MAP_ID}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        cameraControl={false}
        clickableIcons={false}
        gestureHandling="greedy"
        className="size-full"
        {...map}
      >
        {children}
      </Map>
    </APIProvider>
  )
}

export function Pin({ html }: { html: string }) {
  // Centre the 30 px circle on the coordinate (AdvancedMarker anchors bottom-centre).
  return <div style={{ transform: 'translateY(50%)' }} dangerouslySetInnerHTML={{ __html: html }} />
}

/** The wrapper has no Polyline component, so draw one on the map instance and clean up on change. */
export function GPolyline({ path, ...opts }: { path: [number, number][] } & Omit<google.maps.PolylineOptions, "path">) {
  const map = useMap()
  useEffect(() => {
    if (!map || path.length < 2) return
    const line = new google.maps.Polyline({ ...opts, path: path.map(([lat, lng]) => ({ lat, lng })), map })
    return () => line.setMap(null)
  }, [map, path, opts.strokeColor, opts.strokeOpacity, opts.strokeWeight]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
