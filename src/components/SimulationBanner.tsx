import { Icon } from '@iconify/react'
import { SIM_TITLES } from '../api/simulate'
import { useSetSimulation, useSimulation } from '../hooks/useSimulation'

/** Sticks under the app bar for as long as a demo failure is switched on. */
export default function SimulationBanner() {
  const mode = useSimulation()
  const set = useSetSimulation()
  if (!mode) return null
  return (
    <div role="status" className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-arriving/30 bg-arriving-soft px-4 py-2 text-sm text-arriving md:px-6">
      <p className="flex items-center gap-2">
        <Icon icon="solar:bug-linear" className="size-[18px] shrink-0" aria-hidden />
        <span>
          Mode simulasi: <strong>{SIM_TITLES[mode]}</strong> aktif
        </span>
      </p>
      <button
        type="button"
        onClick={() => set(null)}
        className="rounded-lg border border-arriving/40 bg-paper px-3 py-1 font-medium hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Matikan simulasi
      </button>
    </div>
  )
}
