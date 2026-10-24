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
    view: 'kendaraan',
  })
  expect(parseUrlState('')).toEqual({ routes: [], trips: [], page: 1, size: 10, vehicle: null, view: 'kendaraan' })
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

it('membaca halaman aktif dan mengosongkan kendaraan saat berpindah', () => {
  expect(parseUrlState('?view=peta').view).toBe('peta')
  expect(parseUrlState('?view=lain').view).toBe('kendaraan')
  expect(buildSearch(parseUrlState('?view=data&route=Red'))).toBe('?route=Red&view=data')
  window.history.replaceState(null, '', '/?route=Red&vehicle=y1')
  const { result } = renderHook(() => useUrlState())
  act(() => result.current[1]({ view: 'peta' }))
  expect(window.location.search).toBe('?route=Red&view=peta')
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
