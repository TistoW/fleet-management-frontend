import { Icon } from '@iconify/react'
import { useEffect, useMemo, useState } from 'react'
import type { RouteView } from '../../api/routes'
import PageSizeSelect from '../../components/PageSizeSelect'
import Pagination from '../../components/Pagination'
import Spinner from '../../components/Spinner'
import StaleBanner from '../../components/StaleBanner'
import { useRateLimitRetry } from '../../hooks/useRateLimitRetry'
import { formatClockWib } from '../../lib/format'
import { useUrlState } from '../../hooks/useUrlState'
import { useVehicles } from '../../hooks/useVehicles'
import { pageAfterSizeChange, paginate, rangeText } from '../../lib/paginate'
import VehicleFilters from './VehicleFilters'
import VehicleDetailModal from './VehicleDetailModal'
import VehicleGrid from './VehicleGrid'

export default function VehiclesPage() {
  const [url, setUrl] = useUrlState()
  const [auto, setAuto] = useState(true)
  const { data, isPending, isFetching, isError, error, refetch, dataUpdatedAt } = useVehicles(
    { routes: url.routes, trips: url.trips },
    auto,
  )
  const countdown = useRateLimitRetry(error, () => void refetch())
  const hasFilters = url.routes.length > 0 || url.trips.length > 0
  const result = paginate(data ?? [], url.page, url.size)

  // Filters or the live fleet shrank: bring the URL back to a page that exists.
  useEffect(() => {
    if (data && result.page !== url.page) setUrl({ page: result.page }, { replace: true })
  }, [data, result.page, url.page, setUrl])

  const knownRoutes = useMemo(() => {
    const seen = new Map<string, RouteView>()
    for (const v of data ?? []) if (v.route) seen.set(v.route.id, v.route)
    return [...seen.values()]
  }, [data])

  const showBars = !!data && data.length > 0

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-ink-muted">
        {dataUpdatedAt > 0 && (
          <span className="tabular-nums">Diperbarui {formatClockWib(new Date(dataUpdatedAt).toISOString())} WIB</span>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="size-4 accent-accent" />
          Otomatis tiap 30 detik
        </label>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 font-medium text-ink hover:bg-canvas disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isFetching ? <Spinner /> : <Icon icon="solar:refresh-bold" className="size-4" aria-hidden />}
          Muat ulang
        </button>
      </div>
      {isError && data && <StaleBanner updatedAt={dataUpdatedAt} countdown={countdown} onRetry={() => void refetch()} />}
      <VehicleFilters routes={url.routes} trips={url.trips} onChange={setUrl} knownRoutes={knownRoutes} />
      {data && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-ink-muted tabular-nums" aria-live="polite">
            {rangeText(result.from, result.to, result.total)}
            {isFetching && <Spinner />}
          </p>
          {showBars && <PageSizeSelect size={url.size} onChange={(size) => setUrl({ size, page: pageAfterSizeChange(result.from, size) })} />}
        </div>
      )}
      <div className={isFetching && data ? 'opacity-60 transition-opacity' : undefined}>
        <VehicleGrid
          vehicles={data && result.pageItems}
          isPending={isPending}
          error={error}
          skeletonCount={url.size}
          hasFilters={hasFilters}
          onClearFilters={() => setUrl({ routes: [], trips: [] })}
          onRetry={() => void refetch()}
          onOpen={(id) => setUrl({ vehicle: id })}
        />
      </div>
      {url.vehicle && (
        <VehicleDetailModal
          id={url.vehicle}
          preview={data?.find((x) => x.id === url.vehicle)}
          autoRefresh={auto}
          onClose={() => (window.history.state?.fromApp ? window.history.back() : setUrl({ vehicle: null }, { replace: true }))}
        />
      )}
      {showBars && (
        <div className="mt-6">
          <Pagination page={result.page} pageCount={result.pageCount} onPageChange={(page) => setUrl({ page })} />
        </div>
      )}
    </>
  )
}
