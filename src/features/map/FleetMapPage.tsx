import { Icon } from '@iconify/react'
import { lazy, Suspense, useMemo, useState } from 'react'
import type { RouteView } from '../../api/routes'
import EmptyState, { primaryBtn } from '../../components/EmptyState'
import ErrorBoundary from '../../components/ErrorBoundary'
import ErrorState from '../../components/ErrorState'
import Spinner from '../../components/Spinner'
import StaleBanner from '../../components/StaleBanner'
import { useRouteShapes } from '../../hooks/useJourney'
import type { FleetQuery, SetUrl } from '../../hooks/useFleet'
import type { UrlState } from '../../hooks/useUrlState'
import { applyStatus, fleetStats } from '../../lib/fleetStats'
import { applySearch } from '../../lib/search'
import { statusInfo } from '../../lib/status'
import ProviderMap from './ProviderMap'
import VehicleFilters from '../vehicles/VehicleFilters'

// Leaflet only loads when this view opens.
const loadMap = () => lazy(() => import('./FleetMap'))

const GoogleFleet = lazy(() => import('./GoogleFleetMap'))

const LEGEND_MAX = 8

interface Props {
  url: UrlState
  setUrl: SetUrl
  fleet: FleetQuery
  sheetOpen?: boolean
  onSheetClose?: () => void
  onOpenFilters?: () => void
}

export default function FleetMapPage({ url, setUrl, fleet, sheetOpen, onSheetClose, onOpenFilters }: Props) {
  const { data, isPending, isError, error, refetch, dataUpdatedAt, countdown, isPlaceholderData } = fleet
  const [FleetMap, setFleetMap] = useState(loadMap)

  const placed = useMemo(() => applyStatus(applySearch(data ?? [], url.q), url.status).filter((v) => v.lat != null && v.lng != null), [data, url.status, url.q])
  const stats = useMemo(() => fleetStats(placed), [placed])
  const knownRoutes = useMemo(() => {
    const seen = new Map<string, RouteView>()
    for (const v of data ?? []) if (v.route) seen.set(v.route.id, v.route)
    return [...seen.values()]
  }, [data])
  const legend = useMemo(() => {
    const count = new Map<string, number>()
    for (const v of placed) if (v.route) count.set(v.route.id, (count.get(v.route.id) ?? 0) + 1)
    return knownRoutes
      .map((route) => ({ route, n: count.get(route.id) ?? 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
  }, [knownRoutes, placed])

  // One selected route: its line goes faintly behind the markers (one cached request per route).
  const onlyRoute = url.routes.length === 1 ? knownRoutes.find((r) => r.id === url.routes[0]) : undefined
  const routeShapes = useRouteShapes(onlyRoute?.id)
  const routeLines = onlyRoute && routeShapes.data?.length ? { color: onlyRoute.color, lines: routeShapes.data } : undefined

  const hasFilters = url.routes.length > 0 || url.trips.length > 0 || !!url.status || !!url.q.trim()
  const fitKey = isPlaceholderData ? null : `${url.routes.join(',')}|${url.trips.join(',')}|${url.q}`

  const box = 'flex min-h-[26rem] flex-1 items-center justify-center rounded-2xl border border-line bg-paper max-md:rounded-none max-md:border-0'
  let body
  if (isPending) {
    body = (
      <div role="status" className={`${box} gap-3 text-sm text-ink-muted motion-safe:animate-pulse`}>
        <Spinner className="size-5" /> Memuat posisi kendaraan
      </div>
    )
  } else if (error && !data) {
    body = <ErrorState error={error} onRetry={() => void refetch()} />
  } else if (placed.length === 0) {
    body = (
      <EmptyState
        title="Belum ada kendaraan di peta"
        message={hasFilters ? 'Tidak ada kendaraan dengan posisi untuk filter ini.' : 'MBTA belum mengirim posisi kendaraan saat ini.'}
        action={
          hasFilters && (
            <button type="button" onClick={() => setUrl({ routes: [], trips: [], status: null, q: '' })} className={primaryBtn}>
              Hapus filter
            </button>
          )
        }
      />
    )
  } else {
    body = (
      <div className="relative flex min-h-[26rem] flex-1 flex-col overflow-hidden rounded-2xl max-md:min-h-0 max-md:rounded-none">
        <ErrorBoundary
          fallback={(reset) => (
            <div role="alert" className={`${box} flex-col gap-3 text-sm text-ink-muted`}>
              Peta gagal dimuat
              <button
                type="button"
                onClick={() => {
                  setFleetMap(loadMap)
                  reset()
                }}
                className="rounded-lg border border-line bg-paper px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Coba lagi
              </button>
            </div>
          )}
        >
          <Suspense
            fallback={
              <div className={`${box} motion-safe:animate-pulse`}>
                <Spinner className="size-6 text-ink-muted" />
              </div>
            }
          >
            <ProviderMap Osm={FleetMap} Google={GoogleFleet} mapProps={{ vehicles: placed, fitKey, focusId: url.focus, routeLines, onOpen: (id: string) => setUrl({ vehicle: id }) }} />
          </Suspense>
        </ErrorBoundary>
        <button
          type="button"
          onClick={onOpenFilters}
          className="absolute left-3 top-3 z-10 inline-flex h-12 items-center gap-2 rounded-full bg-paper px-4 text-sm font-medium shadow-md active:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          <Icon icon="solar:filter-linear" className="size-5" aria-hidden />
          Filter{hasFilters ? ` · ${url.routes.length + url.trips.length + (url.status ? 1 : 0)}` : ''}
        </button>
        <div className="pointer-events-none absolute bottom-8 left-3 z-10">
          <div className="pointer-events-auto max-h-48 w-auto sm:w-56 overflow-y-auto rounded-xl border border-line bg-paper/95 p-3 text-sm shadow-sm">
            <p className="flex items-center gap-2 font-semibold tabular-nums">
              <Icon icon="solar:bus-linear" className="size-4 text-accent" aria-hidden />
              {placed.length} kendaraan di peta
            </p>
            <p className="mt-1 hidden flex-wrap gap-1.5 text-xs sm:flex">
              <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 ${statusInfo('IN_TRANSIT_TO').tone}`}>
                <Icon icon={statusInfo('IN_TRANSIT_TO').icon} className="size-3.5" aria-hidden />
                {stats.berjalan} berjalan
              </span>
              <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 ${statusInfo('STOPPED_AT').tone}`}>
                <Icon icon={statusInfo('STOPPED_AT').icon} className="size-3.5" aria-hidden />
                {stats.berhenti} berhenti
              </span>
            </p>
            {legend.length > 0 && (
              <ul className="mt-2 hidden space-y-1 text-xs text-ink-muted sm:block">
                {legend.slice(0, LEGEND_MAX).map(({ route, n }) => (
                  <li key={route.id} className="flex items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full ring-1 ring-line" style={{ backgroundColor: route.color }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{route.name}</span>
                    <span className="tabular-nums">{n}</span>
                  </li>
                ))}
                {legend.length > LEGEND_MAX && <li>dan {legend.length - LEGEND_MAX} rute lain</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 max-md:gap-0">
      <p className="text-sm text-ink-muted max-md:hidden">Lihat sebaran bus di peta. Ketuk penanda untuk membuka detail kendaraan.</p>
      {isError && data && <StaleBanner updatedAt={dataUpdatedAt} countdown={countdown} onRetry={() => void refetch()} />}
      <div className="max-md:px-4 max-md:has-[ul]:py-2">
        <VehicleFilters routes={url.routes} trips={url.trips} status={url.status} query={url.q} sheetOpen={sheetOpen} onSheetClose={onSheetClose} onChange={setUrl} knownRoutes={knownRoutes} />
      </div>
      {body}
    </div>
  )
}
