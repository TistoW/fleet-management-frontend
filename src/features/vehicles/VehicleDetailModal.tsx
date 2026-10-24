import { Icon } from '@iconify/react'
import { lazy, Suspense, useEffect, useId, useRef, type ReactNode } from 'react'
import { ApiError } from '../../api/errors'
import type { VehicleView } from '../../api/vehicles'
import ErrorState from '../../components/ErrorState'
import { DetailRowSkeleton } from '../../components/Skeletons'
import StatusBadge from '../../components/StatusBadge'
import { useVehicleDetail } from '../../hooks/useVehicleDetail'
import { formatClockWib, formatCoord, formatRelative } from '../../lib/format'
import Spinner from '../../components/Spinner'
import { occupancyLabel, routeTypeLabel, statusInfo } from '../../lib/status'

// Leaflet (~150 KB) only loads when a popup opens.
const VehicleMap = lazy(() => import('./VehicleMap'))

interface Props {
  id: string
  /** Basic data already in the list, shown while the detail request is in flight. */
  preview?: VehicleView
  onClose: () => void
  autoRefresh?: boolean
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-3">
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
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
      className="m-auto h-dvh w-full max-w-none overflow-y-auto bg-paper p-0 text-ink backdrop:bg-ink/40 sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-xl sm:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
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
          className="rounded-lg p-1 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon icon="solar:close-circle-bold" className="size-7" aria-hidden />
        </button>
      </div>

      {q.isError && !v ? (
        <div className="p-5">
          <ErrorState error={q.error} onRetry={retry} />
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
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
                        <Row label="Block">
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
          <div className="min-h-64">
            {v && v.lat != null && v.lng != null ? (
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
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-lg bg-canvas px-4 text-center text-sm text-ink-muted">
                {d ? 'Posisi kendaraan belum tersedia' : <Spinner className="size-6" />}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
