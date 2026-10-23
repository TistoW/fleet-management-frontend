import type { VehicleView } from '../../api/vehicles'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import { VehicleCardSkeleton } from '../../components/Skeletons'
import VehicleCard from './VehicleCard'

interface Props {
  vehicles?: VehicleView[]
  isPending: boolean
  error: unknown
  skeletonCount?: number
  hasFilters?: boolean
  onClearFilters?: () => void
  onRetry: () => void
  onOpen: (id: string) => void
}

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function VehicleGrid({
  vehicles,
  isPending,
  error,
  skeletonCount = 10,
  hasFilters,
  onClearFilters,
  onRetry,
  onOpen,
}: Props) {
  if (isPending) {
    return (
      <div className={GRID} role="status" aria-label="Memuat kendaraan">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (!vehicles) return <ErrorState error={error} onRetry={onRetry} />
  if (vehicles.length === 0) {
    return hasFilters ? (
      <EmptyState
        title="Tidak ada kendaraan yang cocok"
        message="Coba ubah atau hapus filter."
        action={
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Hapus semua filter
          </button>
        }
      />
    ) : (
      <EmptyState
        title="Belum ada kendaraan yang melapor posisi saat ini"
        message="MBTA biasanya tidak beroperasi sekitar pukul 01:00-05:00 waktu Boston."
      />
    )
  }
  return (
    <ul className={GRID}>
      {vehicles.map((v) => (
        <li key={v.id}>
          <VehicleCard vehicle={v} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}
