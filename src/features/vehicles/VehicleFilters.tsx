import { useMemo } from 'react'
import { describeError } from '../../api/errors'
import type { RouteView } from '../../api/routes'
import MultiSelect, { type Option } from '../../components/MultiSelect'
import { useRouteOptions } from '../../hooks/useRouteOptions'

interface Props {
  routes: string[]
  onRoutesChange: (routes: string[]) => void
  /** Routes seen on vehicles, used to name chips from the URL before /routes has loaded them. */
  knownRoutes?: RouteView[]
}

const toOption = (r: RouteView): Option => ({
  value: r.id,
  label: r.name,
  description: [r.longName !== r.name ? r.longName : '', r.description].filter(Boolean).join(' · ') || undefined,
  swatch: r.color,
})

export default function VehicleFilters({ routes, onRoutesChange, knownRoutes = [] }: Props) {
  const q = useRouteOptions()
  const options = useMemo(() => q.routes.map(toOption), [q.routes])
  const known = useMemo(() => knownRoutes.map(toOption), [knownRoutes])

  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MultiSelect
        label="Route"
        placeholder="Semua route"
        options={options}
        selected={routes}
        selectedOptions={known}
        onChange={onRoutesChange}
        isLoading={q.isPending}
        error={q.isError && options.length === 0 ? describeError(q.error).title : undefined}
        onRetry={() => void q.refetch()}
        hasMore={q.hasNextPage}
        isLoadingMore={q.isFetchingNextPage}
        onLoadMore={() => void q.fetchNextPage()}
        emptyText="Tidak ada route"
      />
    </div>
  )
}
