import { useEffect, useMemo, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import { primaryBtn } from '../../components/EmptyState'
import { useIsMobile } from '../../hooks/useIsMobile'
import ActiveFilters, { type Chip } from '../../components/ActiveFilters'
import { STATUS_FILTER_LABEL } from '../../lib/fleetStats'
import { describeError } from '../../api/errors'
import type { RouteView } from '../../api/routes'
import type { TripView } from '../../api/trips'
import SearchField from '../../components/SearchField'
import MultiSelect, { type Option } from '../../components/MultiSelect'
import { useRouteOptions } from '../../hooks/useRouteOptions'
import { useTripOptions } from '../../hooks/useTripOptions'
import type { StatusFilter, UrlState } from '../../hooks/useUrlState'
import { useVehicles } from '../../hooks/useVehicles'
import { pruneTrips } from '../../lib/tripSelection'
import { formatHmWib } from '../../lib/format'
import { groupTrips, OTHER, RUNNING, tripSummary, type TripEntry } from '../../lib/tripGroups'

interface Props {
  routes: string[]
  trips: string[]
  status?: StatusFilter | null
  query?: string
  /** Phones: the filters live in a bottom sheet opened from the app bar. */
  sheetOpen?: boolean
  onSheetClose?: () => void
  onChange: (patch: Partial<Pick<UrlState, 'routes' | 'trips' | 'status' | 'q'>>, opts?: { replace?: boolean }) => void
  /** Routes seen on vehicles, used to name chips from the URL before /routes has loaded them. */
  knownRoutes?: RouteView[]
}

const toOption = (r: RouteView): Option => ({
  value: r.id,
  label: r.name,
  description: [r.longName !== r.name ? r.longName : '', r.description].filter(Boolean).join(' · ') || undefined,
  swatch: r.color,
})

const ALL = OTHER

export default function VehicleFilters({ routes, trips, status = null, query = '', sheetOpen = false, onSheetClose = () => {}, onChange, knownRoutes = [] }: Props) {
  const q = useRouteOptions()
  const options = useMemo(() => q.routes.map(toOption), [q.routes])
  const known = useMemo(() => knownRoutes.map(toOption), [knownRoutes])
  const [notice, setNotice] = useState('')

  // Same cache entry as the page when no trip is selected, so usually no extra request.
  const running = useVehicles({ routes })
  const runningIds = useMemo(
    () => [...new Set((running.data ?? []).map((v) => v.tripId).filter((id): id is string => !!id))],
    [running.data],
  )
  const t = useTripOptions(routes, runningIds, trips)

  const routeById = useMemo(() => {
    const m = new Map<string, RouteView>()
    for (const r of [...knownRoutes, ...q.routes]) m.set(r.id, r)
    return m
  }, [knownRoutes, q.routes])

  const tripById = useMemo(() => {
    const m = new Map<string, TripView>()
    for (const x of [...t.allTrips, ...t.namedTrips]) m.set(x.id, x)
    return m
  }, [t.allTrips, t.namedTrips])

  const toTripOption = (x: TripView, group: string, e?: TripEntry): Option => {
    const r = x.routeId ? routeById.get(x.routeId) : undefined
    const dir = r?.directionNames[x.directionId]
    const time = formatHmWib(e?.time)
    const base = x.headsign || x.name || `Trip ${x.id}`
    return {
      value: x.id,
      label: time ? `${base} · ${time}` : base,
      description: [e?.vehicle && `Kendaraan ${e.vehicle}`, r?.name, dir && `arah ${dir}`, !e?.vehicle && `trip ${x.id}`].filter(Boolean).join(' · '),
      swatch: r?.color,
      group,
      groupHint: group === OTHER ? 'belum berangkat atau sudah selesai' : undefined,
      muted: group === OTHER,
    }
  }

  const vehicleByTrip = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of running.data ?? []) if (v.tripId) m.set(v.tripId, v.label)
    return m
  }, [running.data])

  const entries = useMemo(
    () => groupTrips(t.namedTrips, t.allTrips, vehicleByTrip, t.times),
    [t.namedTrips, t.allTrips, vehicleByTrip, t.times],
  )
  const tripOptions = useMemo(
    () => entries.map((e) => toTripOption(e.trip, e.running ? RUNNING : OTHER, e)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, routeById],
  )
  const tripSummaryText = tripOptions.length ? tripSummary(entries, !!t.all.hasNextPage) : undefined

  const tripChips = useMemo(
    () => trips.map((id) => tripById.get(id)).filter((x): x is TripView => !!x).map((x) => toTripOption(x, ALL)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trips, tripById, routeById],
  )

  const routeOf = (id: string) => tripById.get(id)?.routeId

  // Trips restored from the URL whose route is not selected (or no route at all) are dropped.
  useEffect(() => {
    const { kept, removed } = pruneTrips(trips, routes, routeOf)
    if (removed.length) onChange({ trips: kept }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, routes, tripById])

  const changeRoutes = (next: string[]) => {
    const { kept, removed } = pruneTrips(trips, next, routeOf)
    const names = [...new Set(removed.map((id) => routeById.get(routeOf(id) ?? '')?.name).filter(Boolean))]
    setNotice(removed.length ? `${removed.length} trip ikut dilepas${names.length ? ` dari ${names.join(', ')}` : ''}` : '')
    onChange({ routes: next, trips: kept })
  }

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(id)
  }, [notice])

  const noRoute = routes.length === 0
  const mobile = useIsMobile()

  const chips: Chip[] = [
    ...routes.map((id) => {
      const r = routeById.get(id)
      return { key: `r${id}`, label: r?.name ?? id, swatch: r?.color, onRemove: () => changeRoutes(routes.filter((x) => x !== id)) }
    }),
    ...tripChips.length === trips.length
      ? tripChips.map((o) => ({ key: `t${o.value}`, label: o.label, swatch: o.swatch, onRemove: () => onChange({ trips: trips.filter((x) => x !== o.value) }) }))
      : trips.map((id) => ({ key: `t${id}`, label: `Trip ${id}`, onRemove: () => onChange({ trips: trips.filter((x) => x !== id) }) })),
    ...(query.trim() ? [{ key: 'q', label: `Cari: “${query.trim()}”`, onRemove: () => onChange({ q: '' }) }] : []),
    ...(status ? [{ key: 's', label: STATUS_FILTER_LABEL[status], onRemove: () => onChange({ status: null }) }] : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      {mobile ? (
        sheetOpen && (
          <BottomSheet
            title="Filter"
            onClose={onSheetClose}
            footer={
              <>
                <button
                  type="button"
                  onClick={() => onChange({ routes: [], trips: [], status: null })}
                  className="h-12 flex-1 rounded-xl border border-line text-sm font-medium active:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Reset
                </button>
                <button type="button" onClick={onSheetClose} className={`${primaryBtn} h-12 flex-1`}>
                  Terapkan
                </button>
              </>
            }
          >
            <div className="grid min-h-[22rem] content-start gap-4">
        <MultiSelect
          label="Rute"
          placeholder="Semua rute"
          options={options}
          selected={routes}
          selectedOptions={known}
          onChange={changeRoutes}
          hideChips
          isLoading={q.isPending}
          error={q.isError && options.length === 0 ? describeError(q.error).title : undefined}
          onRetry={() => void q.refetch()}
          hasMore={q.hasNextPage}
          isLoadingMore={q.isFetchingNextPage}
          onLoadMore={() => void q.fetchNextPage()}
          emptyText="Tidak ada rute"
        />
        <MultiSelect
          label="Trip"
          placeholder="Semua trip"
          options={tripOptions}
          summary={tripSummaryText}
          selected={trips}
          selectedOptions={tripChips}
          onChange={(next) => onChange({ trips: next })}
          hideChips
          disabled={noRoute}
          disabledHint="Pilih rute dulu untuk melihat trip"
          isLoading={!noRoute && t.all.isPending && tripOptions.length === 0}
          error={t.all.isError && tripOptions.length === 0 ? describeError(t.all.error).title : undefined}
          onRetry={() => void t.all.refetch()}
          hasMore={t.all.hasNextPage}
          isLoadingMore={t.all.isFetchingNextPage}
          onLoadMore={() => void t.all.fetchNextPage()}
          emptyText="Belum ada trip hari ini untuk rute ini"
        />
        <p className="self-end pb-2 text-xs text-ink-muted max-lg:sm:col-span-2" aria-live="polite">
          {notice || (noRoute ? '' : 'Trip mempersempit hasil di dalam rute yang dipilih.')}
        </p>
            </div>
          </BottomSheet>
        )
      ) : (
        <div className="flex flex-wrap items-start gap-2.5 rounded-2xl border border-line bg-paper p-2.5">
        <SearchField value={query} onChange={(next) => onChange({ q: next })} shortcut className="min-w-[17.5rem] basis-full xl:basis-0 xl:flex-1" />
        <MultiSelect
          compact
          className="min-w-[12rem] flex-1 xl:w-60 xl:flex-none"
          label="Rute"
          placeholder="Semua rute"
          options={options}
          selected={routes}
          selectedOptions={known}
          onChange={changeRoutes}
          hideChips
          isLoading={q.isPending}
          error={q.isError && options.length === 0 ? describeError(q.error).title : undefined}
          onRetry={() => void q.refetch()}
          hasMore={q.hasNextPage}
          isLoadingMore={q.isFetchingNextPage}
          onLoadMore={() => void q.fetchNextPage()}
          emptyText="Tidak ada rute"
        />
        <MultiSelect
          compact
          className="min-w-[12rem] flex-1 xl:w-60 xl:flex-none"
          label="Trip"
          placeholder="Semua trip"
          options={tripOptions}
          summary={tripSummaryText}
          selected={trips}
          selectedOptions={tripChips}
          onChange={(next) => onChange({ trips: next })}
          hideChips
          disabled={noRoute}
          disabledHint="Pilih rute dulu untuk melihat trip"
          isLoading={!noRoute && t.all.isPending && tripOptions.length === 0}
          error={t.all.isError && tripOptions.length === 0 ? describeError(t.all.error).title : undefined}
          onRetry={() => void t.all.refetch()}
          hasMore={t.all.hasNextPage}
          isLoadingMore={t.all.isFetchingNextPage}
          onLoadMore={() => void t.all.fetchNextPage()}
          emptyText="Belum ada trip hari ini untuk rute ini"
        />
        {notice && (
          <p className="basis-full text-xs text-ink-muted" aria-live="polite">
            {notice}
          </p>
        )}
        </div>
      )}
      <ActiveFilters chips={chips} onClear={() => onChange({ routes: [], trips: [], status: null, q: '' })} />
    </div>
  )
}
