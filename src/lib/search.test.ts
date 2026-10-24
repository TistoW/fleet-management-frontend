import { expect, it } from 'vitest'
import type { VehicleView } from '../api/vehicles'
import { applySearch, matchesQuery } from './search'

const v = (id: string, label: string, routeName: string, headsign: string | null): VehicleView => ({
  id,
  label,
  status: 'STOPPED_AT',
  lat: 1,
  lng: 1,
  updatedAt: '2026-10-22T23:14:52-04:00',
  directionId: 0,
  bearing: null,
  occupancy: null,
  routeId: routeName,
  tripId: null,
  headsign,
  route: { id: routeName, name: routeName, longName: `${routeName} Long`, color: '000', textColor: 'fff', type: 1, description: '', directionNames: [] } as VehicleView['route'],
})

const fleet = [v('y1', '0702', 'Blue Line', 'Bowdoin'), v('y2', 'GLORY', 'Hingham/Hull Ferry', 'Boston'), v('y3', '0738', 'Red Line', null)]

it('cocok dengan label, id, rute, dan tujuan tanpa peduli huruf besar', () => {
  expect(applySearch(fleet, '0702').map((x) => x.id)).toEqual(['y1'])
  expect(applySearch(fleet, 'glory').map((x) => x.id)).toEqual(['y2'])
  expect(applySearch(fleet, 'RED').map((x) => x.id)).toEqual(['y3'])
  expect(applySearch(fleet, 'bowdoin').map((x) => x.id)).toEqual(['y1'])
  expect(applySearch(fleet, 'y3').map((x) => x.id)).toEqual(['y3'])
})

it('semua kata harus cocok; kosong berarti semua', () => {
  expect(applySearch(fleet, 'blue bowdoin')).toHaveLength(1)
  expect(applySearch(fleet, 'blue boston')).toHaveLength(0)
  expect(applySearch(fleet, '   ')).toBe(fleet)
  expect(matchesQuery(fleet[2], 'tidak ada')).toBe(false)
})
