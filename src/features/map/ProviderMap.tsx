import { useEffect, type ComponentType, type LazyExoticComponent } from 'react'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useMapProvider, type Provider } from './provider'

export type GoogleProps = { onFail: () => void }

interface Props<P extends object> {
  /** Leaflet map, already lazy (the caller owns its retry). */
  Osm: LazyExoticComponent<ComponentType<P>>
  /** Google map, lazy at module level: its chunk and script load only after the user switches to Google. */
  Google: LazyExoticComponent<ComponentType<P & GoogleProps>>
  mapProps: P
}

const OPTIONS: [Provider, string][] = [
  ['osm', 'OpenStreetMap'],
  ['google', 'Google Maps'],
]

function Bounce({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount])
  return null
}

/** Picks the map implementation and draws the switch. Must sit inside a positioned box and a Suspense. */
export default function ProviderMap<P extends object>({ Osm, Google, mapProps }: Props<P>) {
  const { provider, choose, fail, failed, canSwitch } = useMapProvider()
  return (
    <>
      {provider === 'google' ? (
        <ErrorBoundary fallback={() => <Bounce onMount={fail} />}>
          <Google {...mapProps} onFail={fail} />
        </ErrorBoundary>
      ) : (
        <Osm {...mapProps} />
      )}
      {canSwitch && (
        <div role="group" aria-label="Sumber peta" className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-1.5">
          <div className="inline-flex overflow-hidden rounded-lg border border-line bg-paper text-xs font-medium shadow-sm">
            {OPTIONS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={provider === id}
                onClick={() => choose(id)}
                className={`px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${provider === id ? 'bg-accent text-white' : 'text-ink-muted hover:bg-canvas'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {failed && (
            <p role="status" className="rounded-md bg-paper/95 px-2 py-1 text-xs text-ink-muted shadow-sm">
              Google Maps tidak tersedia, kembali ke OpenStreetMap
            </p>
          )}
        </div>
      )}
    </>
  )
}
