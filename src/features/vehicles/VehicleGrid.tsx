import type { VehicleView } from '../../api/vehicles'
import VehicleCard from './VehicleCard'

export default function VehicleGrid({ vehicles, onOpen }: { vehicles: VehicleView[]; onOpen: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((v) => (
        <li key={v.id}>
          <VehicleCard vehicle={v} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}
