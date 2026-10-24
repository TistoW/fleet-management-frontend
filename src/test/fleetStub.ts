import { vi } from 'vitest'

const vehicle = (id: string, label: string, lat: number | null, lng: number | null, route: string, status = 'IN_TRANSIT_TO', trip?: string) => ({
  id,
  type: 'vehicle',
  attributes: { label, current_status: status, latitude: lat, longitude: lng, bearing: 90, direction_id: 0, occupancy_status: null, updated_at: '2026-10-22T23:14:52-04:00', carriages: [] },
  relationships: { route: { data: { id: route, type: 'route' } }, ...(trip ? { trip: { data: { id: trip, type: 'trip' } }, stop: { data: { id: 's1', type: 'stop' } } } : {}) },
})

export const routeRed = { id: 'Red', type: 'route', attributes: { short_name: 'RL', long_name: 'Red Line', color: 'DA291C', text_color: 'FFFFFF', type: 1, direction_names: ['South', 'North'], description: 'Rapid Transit' } }

/** Two vehicles with a position and one without, all on the Red Line. */
export const fleetDoc = {
  data: [vehicle('y1', '1841', 42.37, -71.12, 'Red'), vehicle('y2', '1842', 42.38, -71.1, 'Red'), vehicle('y3', '1843', null, null, 'Red')],
  included: [routeRed],
}

/** Four vehicles: two moving, one arriving, one stopped. */
export const mixedFleetDoc = {
  data: [
    vehicle('m1', '2001', 42.37, -71.12, 'Red', 'IN_TRANSIT_TO', 't1'),
    vehicle('m2', '2002', 42.38, -71.1, 'Red', 'INCOMING_AT'),
    vehicle('m3', '2003', 42.39, -71.09, 'Red', 'STOPPED_AT'),
    vehicle('m4', '2004', 42.4, -71.08, 'Red'),
  ],
  included: [routeRed, { id: 't1', type: 'trip', attributes: { headsign: 'Alewife' } }, { id: 's1', type: 'stop', attributes: { name: 'Harvard' } }],
}

export function stubFleetFetch(doc: { data: { id: string }[]; included: unknown[] } = fleetDoc) {
  const fetchMock = vi.fn(async (url: URL) => {
    const path = url.pathname
    if (path === '/routes' || path === '/trips') return new Response(JSON.stringify({ data: [] }))
    if (path.startsWith('/vehicles/')) {
      const one = doc.data.find((v) => v.id === path.split('/')[2])
      return new Response(JSON.stringify({ data: one, included: doc.included }))
    }
    return new Response(JSON.stringify(doc))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
