import { Icon } from '@iconify/react'
import { lazy, Suspense, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '../../api/errors'
import type { VehicleView } from '../../api/vehicles'
import ErrorBoundary from '../../components/ErrorBoundary'
import ErrorState from '../../components/ErrorState'
import { DetailRowSkeleton } from '../../components/Skeletons'
import StatusBadge from '../../components/StatusBadge'
import { useVehicleDetail } from '../../hooks/useVehicleDetail'
import { formatClockWib, formatCoord, formatRelative } from '../../lib/format'
import Spinner from '../../components/Spinner'
import { occupancyLabel, routeTypeLabel, statusInfo } from '../../lib/status'

// Leaflet (~150 KB) only loads when a popup opens.
const loadMap = () => lazy(() => import('./VehicleMap'))

interface Props {
  id: string
  /** Basic data already in the list, shown while the detail request is in flight. */
  preview?: VehicleView
  onClose: () => void
  autoRefresh?: boolean
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-canvas/70 px-4 py-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <dl className="divide-y divide-line/60 text-sm">{children}</dl>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  )
}

const SkeletonRows = () => (
  <div role="status" aria-label="Memuat detail">
    <DetailRowSkeleton />
    <DetailRowSkeleton />
    <DetailRowSkeleton />
  </div>
)

const access = (n: number) => (n === 1 ? 'Ya' : n === 2 ? 'Tidak' : 'Tidak ada data')

export default function VehicleDetailModal({ id, preview, onClose, autoRefresh }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const q = useVehicleDetail(id, autoRefresh)
  // React.lazy caches a rejected import for good, so a retry needs a fresh lazy component.
  const [VehicleMap, setVehicleMap] = useState(loadMap)
  const d = q.data
  const v = d ?? preview

  // Native <dialog>: the browser makes the page inert (focus trap) and handles ESC.
  useEffect(() => {
    const el = ref.current
    const trigger = document.activeElement as HTMLElement | null
    if (!el) return
    if (typeof el.showModal === 'function') el.showModal()
    else el.setAttribute('open', '')
    return () => {
      el.close?.()
      trigger?.focus?.()
    }
  }, [])

  // 404 means the vehicle is gone: the error action is "Tutup", not a retry.
  const retry = () => (q.error instanceof ApiError && q.error.status === 404 ? onClose() : void q.refetch())
  const route = v?.route
  const dir = route && v?.directionId != null ? route.directionNames[v.directionId] : undefined

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto h-dvh max-h-dvh w-full max-w-none flex-col overflow-hidden bg-paper p-0 text-ink backdrop:bg-ink/40 open:flex max-sm:animate-[sheet-up_.25s_ease-out] sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-2xl sm:shadow-xl"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-mono text-xl font-semibold tabular-nums">
            {v ? `Kendaraan ${v.label}` : 'Memuat kendaraan'}
          </h2>
          {v && (
            <p className="mt-0.5 text-sm text-ink-muted">
              {route ? `${route.name} · ` : ''}
              {statusInfo(v.status).label}
            </p>
          )}
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Tutup"
          className="flex size-12 shrink-0 items-center justify-center rounded-full p-1.5 max-sm:order-first sm:size-auto sm:rounded-xl text-ink-muted hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon icon="solar:arrow-left-linear" className="size-6 sm:hidden" aria-hidden />
          <Icon icon="solar:close-circle-linear" className="hidden size-8 sm:block" aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
      {q.isError && !v ? (
        <div className="p-5">
          <ErrorState error={q.error} onRetry={retry} />
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
          <div className="flex flex-col gap-3">
            {v ? (
              <>
                <StatusBadge status={v.status} />
                <Section title="Posisi">
                  <Row label="Lat">
                    <span className="font-mono tabular-nums">{formatCoord(v.lat)}</span>
                  </Row>
                  <Row label="Lng">
                    <span className="font-mono tabular-nums">{formatCoord(v.lng)}</span>
                  </Row>
                  <Row label="Diperbarui">
                    {formatClockWib(v.updatedAt)} WIB · {formatRelative(v.updatedAt)}
                  </Row>
                </Section>
              </>
            ) : (
              <SkeletonRows />
            )}

            {q.isError && !d ? (
              <ErrorState error={q.error} onRetry={retry} />
            ) : (
              <>
                <Section title="Rute">
                  {route ? (
                    <>
                      <Row label="Nama">
                        <span
                          className="rounded px-1.5 py-0.5 font-semibold"
                          style={{ backgroundColor: route.color, color: route.textColor }}
                        >
                          {route.name}
                        </span>
                      </Row>
                      {route.longName && <Row label="Lengkap">{route.longName}</Row>}
                      <Row label="Jenis">{routeTypeLabel(route.type)}</Row>
                      <Row label="Arah">{dir ?? '-'}</Row>
                    </>
                  ) : d ? (
                    <Row label="Rute">Tidak ada data</Row>
                  ) : (
                    <SkeletonRows />
                  )}
                </Section>
                <Section title="Trip">
                  {d ? (
                    d.trip ? (
                      <>
                        <Row label="Tujuan">{d.trip.headsign || '-'}</Row>
                        {d.trip.name && <Row label="Nama">{d.trip.name}</Row>}
                        <Row label="Blok">
                          <span className="font-mono">{d.trip.blockId || '-'}</span>
                        </Row>
                        <Row label="Kursi roda">{access(d.trip.wheelchair)}</Row>
                        <Row label="Sepeda">{access(d.trip.bikes)}</Row>
                      </>
                    ) : (
                      <Row label="Trip">Tidak ada trip aktif</Row>
                    )
                  ) : (
                    <SkeletonRows />
                  )}
                </Section>
                <Section title="Lainnya">
                  {d ? (
                    <>
                      <Row label="Halte saat ini">
                        {d.stop ? `${d.stop.name}${d.stop.platform ? ` (${d.stop.platform})` : ''}` : '-'}
                      </Row>
                      <Row label="Kecepatan">{d.speed == null ? '-' : `${(d.speed * 3.6).toFixed(0)} km/jam`}</Row>
                      <Row label="Arah hadap">{d.bearing == null ? '-' : `${d.bearing}°`}</Row>
                      <Row label="Okupansi">{occupancyLabel(d.occupancy)}</Row>
                      {d.carriages.length > 0 && (
                        <Row label="Gerbong">
                          {d.carriages.map((c) => `${c.label}: ${occupancyLabel(c.occupancy_status)}`).join(', ')}
                        </Row>
                      )}
                    </>
                  ) : (
                    <SkeletonRows />
                  )}
                </Section>
              </>
            )}
          </div>
          <div className="h-56 min-h-56 overflow-hidden max-sm:order-first max-sm:-mx-4 max-sm:-mt-4 sm:h-auto sm:min-h-64 sm:rounded-xl">
            {v && v.lat != null && v.lng != null ? (
              <ErrorBoundary
                fallback={(reset) => (
                  <div role="alert" className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-lg bg-canvas px-4 text-center text-sm text-ink-muted">
                    Peta gagal dimuat
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleMap(loadMap)
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
                  <div className="flex h-full min-h-64 items-center justify-center rounded-lg bg-canvas motion-safe:animate-pulse">
                    <Spinner className="size-6 text-ink-muted" />
                  </div>
                }
              >
                <VehicleMap
                  lat={v.lat}
                  lng={v.lng}
                  bearing={d?.bearing ?? null}
                  color={route?.color ?? '#5B6863'}
                  textColor={route?.textColor ?? '#FFFFFF'}
                  label={v.label}
                  stop={d?.stop && d.stop.lat != null && d.stop.lng != null ? { lat: d.stop.lat, lng: d.stop.lng, name: d.stop.name } : undefined}
                />
              </Suspense>
              </ErrorBoundary>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-lg bg-canvas px-4 text-center text-sm text-ink-muted">
                {d ? 'Posisi kendaraan belum tersedia' : <Spinner className="size-6" />}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </dialog>
  )
}
