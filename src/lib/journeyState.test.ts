import { expect, it } from 'vitest'
import type { UpcomingStop } from '../api/journey'
import { journeyState, remainingStops } from './journeyState'

const stop = (id: string): UpcomingStop => ({ id, name: id, lat: 1, lng: 2, at: '2026-10-24T10:00:00Z', kind: 'prediction' })

it('no trip at all', () => {
  expect(journeyState({ tripId: null, settled: true, hasShape: false, upcoming: [] })).toBe('no-trip')
})

it('waits for the requests before judging', () => {
  expect(journeyState({ tripId: 't', settled: false, hasShape: false, upcoming: [] })).toBe('loading')
})

it('terminus: a line but nothing left to visit', () => {
  expect(journeyState({ tripId: 't', settled: true, hasShape: true, upcoming: [] })).toBe('terminus')
  // Stopped at the last stop: its own prediction is the only one left, so it is dropped.
  const rest = remainingStops([stop('wonderland')], 'wonderland', true)
  expect(journeyState({ tripId: 't', settled: true, hasShape: true, upcoming: rest })).toBe('terminus')
})

it('unavailable: no shape and no stops', () => {
  expect(journeyState({ tripId: 't', settled: true, hasShape: false, upcoming: [] })).toBe('unavailable')
})

it('ok keeps stops that are ahead, also while stopped', () => {
  const rest = remainingStops([stop('a'), stop('b')], 'a', true)
  expect(rest.map((s) => s.id)).toEqual(['b'])
  expect(journeyState({ tripId: 't', settled: true, hasShape: true, upcoming: rest })).toBe('ok')
})
