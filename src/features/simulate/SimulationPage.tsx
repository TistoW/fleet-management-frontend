import { Icon } from '@iconify/react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SIM_TITLES, setSimulation, type SimMode } from '../../api/simulate'
import { fetchVehicles, type VehicleView } from '../../api/vehicles'
import ErrorState from '../../components/ErrorState'
import type { SetUrl } from '../../hooks/useFleet'
import { useSetSimulation, useSimulation } from '../../hooks/useSimulation'
import { SCENARIOS, type Scenario } from './scenarios'

function Preview({ s }: { s: Scenario }) {
  if ('error' in s.preview) return <ErrorState error={s.preview.error} preview />
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <h3 className="font-semibold">{s.preview.note}</h3>
      <p className="mt-1 text-sm text-ink-muted">{s.preview.detail}</p>
    </div>
  )
}

export default function SimulationPage({ setUrl }: { setUrl: SetUrl }) {
  const active = useSimulation()
  const set = useSetSimulation()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)

  /** A popup needs a real vehicle with a position; the cached list is used, else one plain request. */
  async function vehicleId(mode: SimMode): Promise<string | null> {
    const pick = (list: VehicleView[]) => list.find((v) => v.lat != null && v.lng != null)?.id ?? null
    const id = pick(qc.getQueriesData<VehicleView[]>({ queryKey: ['vehicles'] }).flatMap(([, d]) => d ?? []))
    if (id) return id
    if (mode === 'not-found') return 'contoh'
    setSimulation(null)
    try {
      return pick(await fetchVehicles())
    } catch {
      return null
    }
  }

  async function run(s: Scenario) {
    setBusy(true)
    const id = s.target === 'popup' ? await vehicleId(s.mode) : null
    setBusy(false)
    set(s.mode)
    setUrl({ view: 'kendaraan', ...(id ? { vehicle: id } : {}) })
  }

  return (
    <div className="max-w-6xl">
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        Halaman ini untuk mendemokan pesan error. Pilih skenario, lalu lihat halaman Kendaraan atau Peta. Hanya permintaan dari tab ini yang diubah, data MBTA
        yang asli tidak tersentuh. Tautannya bisa dibagikan, misalnya <span className="font-mono text-[13px]">?simulate=rate-limit</span>.
      </p>
      <ul className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCENARIOS.map((s) => {
          const on = active === s.mode
          return (
            <li key={s.mode} className={`flex flex-col gap-3 rounded-2xl border bg-paper p-5 ${on ? 'border-arriving ring-1 ring-arriving/40' : 'border-line'}`}>
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon icon={s.icon} className="size-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">
                    {SIM_TITLES[s.mode]}
                    {on && <span className="ml-2 rounded-full bg-arriving-soft px-2 py-0.5 text-xs font-medium text-arriving">Aktif</span>}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">{s.summary}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-ink-muted">Pesan yang akan terlihat</p>
                <Preview s={s} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">{s.target === 'popup' ? 'Dibuka di popup kendaraan' : 'Dilihat di halaman Kendaraan'}</p>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Coba: ${SIM_TITLES[s.mode]}`}
                  onClick={() => void run(s)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  Coba
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
