import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildSearch, parseUrlState, useUrlState } from './useUrlState'

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

describe('riwayat popup kendaraan', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'))

  it('menandai popup yang dibuka dari dalam aplikasi, bukan yang dimuat langsung', () => {
    const { result } = renderHook(() => useUrlState())
    act(() => result.current[1]({ vehicle: 'y1' }))
    expect(window.history.state).toEqual({ fromApp: true })
    expect(result.current[0].vehicle).toBe('y1')
    act(() => result.current[1]({ page: 1 }, { replace: true }))
    expect(window.history.state).toEqual({ fromApp: true })
  })

  it('Back menutup popup', async () => {
    const { result } = renderHook(() => useUrlState())
    act(() => result.current[1]({ vehicle: 'y1' }))
    act(() => window.history.back())
    await waitFor(() => expect(result.current[0].vehicle).toBeNull())
  })
})
