import { describe, expect, it } from 'vitest'
import { pruneTrips } from './tripSelection'

const owner: Record<string, string> = { t1: 'Red', t2: 'Red', t3: '1' }
const routeOf = (id: string) => owner[id]

describe('pruneTrips', () => {
  it('drops trips of an unselected route and keeps the rest', () => {
    expect(pruneTrips(['t1', 't2', 't3'], ['1'], routeOf)).toEqual({ kept: ['t3'], removed: ['t1', 't2'] })
  })
  it('keeps everything while all owning routes stay selected', () => {
    expect(pruneTrips(['t1', 't3'], ['Red', '1'], routeOf).removed).toEqual([])
  })
  it('drops every trip when no route is left', () => {
    expect(pruneTrips(['t1', 't3'], [], routeOf).kept).toEqual([])
  })
  it('keeps trips whose route is not known yet', () => {
    expect(pruneTrips(['x'], ['Red'], routeOf)).toEqual({ kept: ['x'], removed: [] })
  })
})
