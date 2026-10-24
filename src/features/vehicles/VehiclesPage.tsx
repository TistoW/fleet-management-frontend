import { useEffect, useMemo } from 'react'
import type { RouteView } from '../../api/routes'
import PageSizeSelect from '../../components/PageSizeSelect'
import Pagination from '../../components/Pagination'
import Spinner from '../../components/Spinner'
import StaleBanner from '../../components/StaleBanner'
import type { FleetQuery, SetUrl } from '../../hooks/useFleet'
import type { UrlState } from '../../hooks/useUrlState'
import { pageAfterSizeChange, paginate, rangeText } from '../../lib/paginate'
import VehicleFilters from './VehicleFilters'
import VehicleGrid from './VehicleGrid'

interface Props {
  url: UrlState
  setUrl: SetUrl
  fleet: FleetQuery
}

export default function VehiclesPage({ url, setUrl, fleet }: Props) {
  const { data, isPending, isFetching, isError, error, refetch, dataUpdatedAt, countdown } = fleet
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
      {showBars && (
        <div className="mt-6">
          <Pagination page={result.page} pageCount={result.pageCount} onPageChange={(page) => setUrl({ page })} />
        </div>
      )}
    </>
  )
}
