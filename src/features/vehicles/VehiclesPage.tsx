import { useEffect } from 'react'
import PageSizeSelect from '../../components/PageSizeSelect'
import Pagination from '../../components/Pagination'
import Spinner from '../../components/Spinner'
import { useUrlState } from '../../hooks/useUrlState'
import { useVehicles } from '../../hooks/useVehicles'
import { pageAfterSizeChange, paginate, rangeText } from '../../lib/paginate'
import VehicleGrid from './VehicleGrid'

export default function VehiclesPage() {
  const [url, setUrl] = useUrlState()
  const { data, isPending, isFetching, error, refetch } = useVehicles({ routes: url.routes, trips: url.trips })
  const hasFilters = url.routes.length > 0 || url.trips.length > 0
  const result = paginate(data ?? [], url.page, url.size)

  // Filters or the live fleet shrank: bring the URL back to a page that exists.
  useEffect(() => {
    if (data && result.page !== url.page) setUrl({ page: result.page }, { replace: true })
  }, [data, result.page, url.page, setUrl])

  const showBars = !!data && data.length > 0

  return (
    <>
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
