import { describe, expect, it } from 'vitest'
import type { TripView } from '../api/trips'
import { formatHmWib } from './format'
import { groupTrips, tripSummary } from './tripGroups'

const trip = (id: string): TripView => ({ id, headsign: 'Braintree', directionId: 0, blockId: '', name: '', wheelchair: 0, bikes: 0, routeId: 'Red' })

describe('groupTrips', () => {
  const vehicles = new Map([['2', '1703']])
  const times = { '1': '2026-10-23T06:00:00-04:00', '2': '2026-10-23T05:00:00-04:00', '3': '2026-10-23T05:30:00-04:00' }
  const out = groupTrips([trip('2')], [trip('1'), trip('2'), trip('3'), trip('4')], vehicles, times)

  it('puts running trips first with their vehicle', () => {
    expect(out[0]).toMatchObject({ running: true, vehicle: '1703' })
    expect(out[0].trip.id).toBe('2')
  })
  it('does not repeat running trips and sorts the rest by departure, unknown last', () => {
    expect(out.map((e) => e.trip.id)).toEqual(['2', '3', '1', '4'])
    expect(out.slice(1).every((e) => !e.running)).toBe(true)
  })
  it('summarises counts, with + while more pages remain', () => {
    expect(tripSummary(out, false)).toBe('1 sedang berjalan · 3 jadwal')
    expect(tripSummary(out, true)).toBe('1 sedang berjalan · 3+ jadwal')
  })
})

describe('formatHmWib', () => {
  it('converts any offset to WIB', () => {
    expect(formatHmWib('2026-10-23T05:15:00-04:00')).toBe('16:15')
  })
  it('returns empty for missing or bad input', () => {
    expect(formatHmWib(undefined)).toBe('')
    expect(formatHmWib('nope')).toBe('')
  })
})
