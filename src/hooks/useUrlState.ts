import { useCallback, useSyncExternalStore } from 'react'

export const PAGE_SIZES = [5, 10, 20, 50] as const
const DEFAULT_SIZE = 10

export const VIEWS = ['kendaraan', 'peta', 'data'] as const
export type View = (typeof VIEWS)[number]

export const STATUS_FILTERS = ['berjalan', 'berhenti'] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]

export interface UrlState {
  routes: string[]
  trips: string[]
  page: number
  size: number
  vehicle: string | null
  /** Quick filter from the stat cards, applied in the browser on top of the route/trip filters. */
  status: StatusFilter | null
  /** Vehicle the map centres on (set by "Lihat di peta"). */
  focus: string | null
  view: View
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

export function parseUrlState(search: string): UrlState {
  const p = new URLSearchParams(search)
  const page = Number(p.get('page'))
  const size = Number(p.get('size'))
  return {
    routes: list(p.get('route')),
    trips: list(p.get('trip')),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_SIZE,
    vehicle: p.get('vehicle') || null,
    status: (STATUS_FILTERS as readonly string[]).includes(p.get('status') ?? '') ? (p.get('status') as StatusFilter) : null,
    focus: p.get('focus') || null,
    view: (VIEWS as readonly string[]).includes(p.get('view') ?? '') ? (p.get('view') as View) : 'kendaraan',
  }
}

/** Default values are left out of the URL to keep links short. */
export function buildSearch(s: UrlState): string {
  const p = new URLSearchParams()
  if (s.routes.length) p.set('route', s.routes.join(','))
  if (s.trips.length) p.set('trip', s.trips.join(','))
  if (s.page > 1) p.set('page', String(s.page))
  if (s.size !== DEFAULT_SIZE) p.set('size', String(s.size))
  if (s.vehicle) p.set('vehicle', s.vehicle)
  if (s.status) p.set('status', s.status)
  if (s.focus) p.set('focus', s.focus)
  if (s.view !== 'kendaraan') p.set('view', s.view)
  const q = p.toString()
  return q ? `?${q}` : ''
}

const CHANGE = 'urlstatechange'

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(CHANGE, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(CHANGE, cb)
  }
}

const getSearch = () => window.location.search

/**
 * Filters, page, size, the open vehicle and the active view (?view=peta|data) live in the query string.
 * Changing a filter resets the page to 1. `replace` is for automatic corrections
 * (such as clamping the page) so they do not add a Back entry.
 */
export function useUrlState() {
  const search = useSyncExternalStore(subscribe, getSearch, () => '')
  const state = parseUrlState(search)

  const update = useCallback((patch: Partial<UrlState>, opts: { replace?: boolean } = {}) => {
    const cur = parseUrlState(window.location.search)
    const filterChanged = 'routes' in patch || 'trips' in patch || 'status' in patch
    // Switching view closes any open popup; filters, page and size carry over.
    const next = { ...cur, ...(filterChanged ? { page: 1 } : {}), ...('view' in patch ? { vehicle: null, focus: null } : {}), ...patch }
    const url = window.location.pathname + buildSearch(next)
    if (url === window.location.pathname + window.location.search) return
    // The marker lets the page tell an in-app popup (close = Back) from a direct ?vehicle= load.
    const marker = opts.replace ? window.history.state : patch.vehicle ? { fromApp: true } : null
    window.history[opts.replace ? 'replaceState' : 'pushState'](marker, '', url)
    window.dispatchEvent(new Event(CHANGE))
  }, [])

  return [state, update] as const
}
