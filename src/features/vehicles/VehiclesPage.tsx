import { useEffect, useMemo, useRef } from 'react'
import type { RouteView } from '../../api/routes'
import { useIsMobile } from '../../hooks/useIsMobile'
import PageSizeSelect from '../../components/PageSizeSelect'
import Pagination from '../../components/Pagination'
import StaleBanner from '../../components/StaleBanner'
import StatCard, { StatCardSkeleton } from '../../components/StatCard'
import type { FleetQuery, SetUrl } from '../../hooks/useFleet'
import type { StatusFilter, UrlState } from '../../hooks/useUrlState'
import { applySearch } from '../../lib/search'
import { applyStatus, fleetStats } from '../../lib/fleetStats'
import { pageAfterSizeChange, paginate, rangeText } from '../../lib/paginate'
import VehicleFilters from './VehicleFilters'
import VehicleGrid from './VehicleGrid'

interface Props {
  url: UrlState
  setUrl: SetUrl
  fleet: FleetQuery
  sheetOpen?: boolean
  onSheetClose?: () => void
  onOpenFilters?: () => void
}

export default function VehiclesPage({ url, setUrl, fleet, sheetOpen, onSheetClose }: Props) {
  const { data, isPending, isFetching, isError, error, refetch, dataUpdatedAt, countdown } = fleet
  const hasFilters = url.routes.length > 0 || url.trips.length > 0 || !!url.status
  const searched = useMemo(() => applySearch(data ?? [], url.q), [data, url.q])
  const stats = useMemo(() => fleetStats(searched), [searched])
  const shown = useMemo(() => applyStatus(searched, url.status), [searched, url.status])
  const result = paginate(shown, url.page, url.size)
  const mobile = useIsMobile()
  const scroller = useRef<HTMLDivElement>(null)

  // Filters or the live fleet shrank: bring the URL back to a page that exists.
  useEffect(() => {
    if (data && result.page !== url.page) setUrl({ page: result.page }, { replace: true })
  }, [data, result.page, url.page, setUrl])

  // Only the list scrolls, so a new page starts at its top.
  useEffect(() => {
    scroller.current?.scrollTo?.({ top: 0 })
  }, [result.page, url.size, url.status, url.q])

  const knownRoutes = useMemo(() => {
    const seen = new Map<string, RouteView>()
    for (const v of data ?? []) if (v.route) seen.set(v.route.id, v.route)
    return [...seen.values()]
  }, [data])

  const toggle = (s: StatusFilter) => setUrl({ status: url.status === s ? null : s })
  const showBars = !!data && shown.length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-sm text-ink-muted max-md:hidden">Pantau posisi dan status bus yang sedang beroperasi. Klik kartu angka untuk menyaring.</p>
      {isError && data && <StaleBanner updatedAt={dataUpdatedAt} countdown={countdown} onRetry={() => void refetch()} />}

      <ul aria-label="Ringkasan armada" className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0 no-scrollbar [&>li]:flex [&>li]:flex-1 [&>li]:snap-start max-md:[&>li]:flex-none">
        {data ? (
          <>
            <li>
              <StatCard icon="solar:bus-linear" tint="bg-accent-soft text-accent" label="Total kendaraan" value={stats.total} active={!url.status} onClick={() => setUrl({ status: null })} />
            </li>
            <li>
              <StatCard icon="solar:routing-2-linear" tint="bg-moving-soft text-moving" label="Sedang berjalan" value={stats.berjalan} active={url.status === 'berjalan'} onClick={() => toggle('berjalan')} />
            </li>
            <li>
              <StatCard icon="solar:stop-circle-linear" tint="bg-stopped-soft text-stopped" label="Berhenti di halte" value={stats.berhenti} active={url.status === 'berhenti'} onClick={() => toggle('berhenti')} />
            </li>
            <li>
              <StatCard icon="solar:danger-triangle-linear" tint="bg-arriving-soft text-arriving" label="GPS tidak update" value={stats.basi} active={url.status === 'basi'} onClick={() => toggle('basi')} />
            </li>
            <li>
              <StatCard icon="solar:map-point-wave-linear" tint="bg-arriving-soft text-arriving" label="Rute aktif" value={stats.routes} />
            </li>
          </>
        ) : (
          [0, 1, 2, 3, 4].map((i) => (
            <li key={i}>
              <StatCardSkeleton />
            </li>
          ))
        )}
      </ul>

      <VehicleFilters routes={url.routes} trips={url.trips} status={url.status} query={url.q} sheetOpen={sheetOpen} onSheetClose={onSheetClose} onChange={setUrl} knownRoutes={knownRoutes} />

      <section aria-label="Daftar kendaraan" className="flex min-h-[22rem] flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-paper max-md:-mx-4 max-md:min-h-0 max-md:rounded-none max-md:border-x-0">
        <div ref={scroller} className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${isFetching && data ? 'opacity-70 transition-opacity' : ''}`}>
          <VehicleGrid
            vehicles={data && result.pageItems}
            isPending={isPending}
            error={error}
            skeletonCount={url.size}
            hasFilters={hasFilters}
            query={url.q.trim()}
            onClearSearch={() => setUrl({ q: '' })}
            onClearFilters={() => setUrl({ routes: [], trips: [], status: null })}
            onRetry={() => void refetch()}
            onOpen={(id) => setUrl({ vehicle: id })}
            onShowOnMap={(id) => setUrl({ view: 'peta', focus: id })}
          />
        </div>
        {data && (
          <footer className="flex shrink-0 items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-paper px-4 py-2.5 max-md:grid max-md:h-14 max-md:grid-cols-[1fr_auto_1fr] max-md:gap-2 max-md:py-0 md:flex-wrap">
            <div className="flex items-center gap-4 max-md:contents">
              <p className="whitespace-nowrap text-sm text-ink-muted tabular-nums max-md:order-1 max-md:text-xs" aria-live="polite">
                {mobile ? (result.total ? `${result.from}-${result.to} dari ${result.total}` : 'Tidak ada data') : rangeText(result.from, result.to, result.total)}
              </p>
              {showBars && <PageSizeSelect size={url.size} onChange={(size) => setUrl({ size, page: pageAfterSizeChange(result.from, size) })} />}
            </div>
            {showBars && <Pagination page={result.page} pageCount={result.pageCount} onPageChange={(page) => setUrl({ page })} />}
          </footer>
        )}
      </section>
    </div>
  )
}
