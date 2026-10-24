/**
 * Fault injection for demos: with `?simulate=<mode>` in the address, the app's own requests fail on
 * purpose, so the friendly error messages can be seen without breaking the real network.
 * The address is the single source of truth, which keeps it shareable and refresh-proof.
 */
export const SIM_MODES = ['offline', 'rate-limit', 'server', 'not-found', 'bad-request', 'slow', 'empty', 'map-fail', 'geocode-fail'] as const
export type SimMode = (typeof SIM_MODES)[number]

export const SIM_TITLES: Record<SimMode, string> = {
  offline: 'Tidak ada koneksi',
  'rate-limit': 'Terlalu banyak permintaan',
  server: 'Server MBTA bermasalah',
  'not-found': 'Kendaraan tidak ditemukan',
  'bad-request': 'Permintaan tidak valid',
  slow: 'Koneksi lambat',
  empty: 'Data kosong',
  'map-fail': 'Peta gagal dimuat',
  'geocode-fail': 'Nama jalan gagal dimuat',
}

export const SLOW_MS = 4000

const KEY = 'simulate'
/** useUrlState listens for this event, so a changed address re-renders the whole app. */
const CHANGE = 'urlstatechange'

export function parseSimulation(search: string): SimMode | null {
  const v = new URLSearchParams(search).get(KEY)
  return (SIM_MODES as readonly string[]).includes(v ?? '') ? (v as SimMode) : null
}

export const getSimulation = () => parseSimulation(window.location.search)

export function setSimulation(mode: SimMode | null) {
  const p = new URLSearchParams(window.location.search)
  if (mode) p.set(KEY, mode)
  else p.delete(KEY)
  const q = p.toString()
  window.history.replaceState(window.history.state, '', window.location.pathname + (q ? `?${q}` : ''))
  window.dispatchEvent(new Event(CHANGE))
}

export function subscribeSimulation(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(CHANGE, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(CHANGE, cb)
  }
}

const json = (status: number, errors: object[]) =>
  new Response(JSON.stringify({ errors }), { status, headers: { 'Content-Type': 'application/vnd.api+json' } })

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
}

/**
 * Stands in for `fetch` while a mode is active: returns a synthetic MBTA-shaped response, throws like a
 * dead network, or returns null to let the real request go ahead. Goes through the same code as real failures.
 */
export async function simulatedFetch(path: string, signal?: AbortSignal): Promise<Response | null> {
  switch (getSimulation()) {
    case 'offline':
      throw new TypeError('Failed to fetch')
    case 'rate-limit':
      return json(429, [{ status: '429', code: 'rate_limited', detail: 'You have exceeded your allowed usage rate.' }])
    case 'server':
      return json(503, [{ status: '503', code: 'service_unavailable' }])
    case 'not-found':
      return /^\/vehicles\/[^/]+$/.test(path) ? json(404, [{ status: '404', code: 'not_found', source: { parameter: 'id' } }]) : null
    case 'bad-request':
      return path === '/vehicles'
        ? json(400, [{ status: '400', code: 'bad_request', detail: 'Invalid filter[route]: "Merah" is not a route id', source: { parameter: 'filter[route]' } }])
        : null
    case 'empty':
      return path === '/vehicles' ? new Response(JSON.stringify({ data: [], included: [] })) : null
    case 'slow':
      await wait(SLOW_MS, signal)
      return null
    default:
      return null
  }
}

/** The map chunks call this before importing, so a failed download can be shown on demand. */
export async function mapGate() {
  if (getSimulation() === 'map-fail') throw new Error('Simulasi: berkas peta gagal diunduh')
}
