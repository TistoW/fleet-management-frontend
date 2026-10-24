import { APIProvider, Map, type MapProps } from '@vis.gl/react-google-maps'
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
