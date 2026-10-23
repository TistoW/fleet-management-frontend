import { expect, it } from 'vitest'
import { buildSearch, parseUrlState } from './useUrlState'

it('membaca parameter dan memakai nilai bawaan', () => {
  expect(parseUrlState('?route=Red,1&trip=7&page=3&size=20&vehicle=y1')).toEqual({
    routes: ['Red', '1'],
    trips: ['7'],
    page: 3,
    size: 20,
    vehicle: 'y1',
  })
  expect(parseUrlState('')).toEqual({ routes: [], trips: [], page: 1, size: 10, vehicle: null })
})

it('menolak page dan size yang tidak valid', () => {
  const s = parseUrlState('?page=0&size=7')
  expect(s.page).toBe(1)
  expect(s.size).toBe(10)
  expect(parseUrlState('?page=abc').page).toBe(1)
})

it('menulis ulang tanpa nilai bawaan', () => {
  expect(buildSearch(parseUrlState(''))).toBe('')
  expect(buildSearch(parseUrlState('?route=Red&page=2&size=5'))).toBe('?route=Red&page=2&size=5')
})
