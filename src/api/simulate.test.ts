import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { apiGet } from './client'
import { ApiError, describeError } from './errors'
import { getSimulation, mapGate, setSimulation, SLOW_MS, type SimMode } from './simulate'

const real = () => vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'real' }] })))

beforeEach(() => window.history.replaceState(null, '', '/'))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function failure(mode: SimMode, path: string) {
  setSimulation(mode)
  const fetchMock = real()
  vi.stubGlobal('fetch', fetchMock)
  const err = await apiGet(path).catch((e) => e)
  expect(fetchMock).not.toHaveBeenCalled()
  return err as ApiError
}

it('mirrors the mode to the address and keeps other parameters', () => {
  window.history.replaceState(null, '', '/?route=Red')
  setSimulation('server')
  expect(window.location.search).toBe('?route=Red&simulate=server')
  expect(getSimulation()).toBe('server')
  setSimulation(null)
  expect(window.location.search).toBe('?route=Red')
  expect(getSimulation()).toBeNull()
  window.history.replaceState(null, '', '/?simulate=bogus')
  expect(getSimulation()).toBeNull()
})

it('does not touch requests when no mode is active', async () => {
  const fetchMock = real()
  vi.stubGlobal('fetch', fetchMock)
  expect((await apiGet<{ id: string }[]>('/vehicles')).data[0].id).toBe('real')
  expect(fetchMock).toHaveBeenCalledOnce()
})

it('offline looks like a dead network', async () => {
  const err = await failure('offline', '/vehicles')
  expect(err.kind).toBe('network')
  expect(describeError(err).title).toBe('Tidak ada koneksi internet')
})

it('rate-limit is a 429 shaped like MBTA', async () => {
  const err = await failure('rate-limit', '/vehicles')
  expect([err.status, err.code]).toEqual([429, 'rate_limited'])
  expect(describeError(err).title).toBe('Terlalu banyak permintaan')
})

it('server is a 503', async () => {
  const err = await failure('server', '/vehicles')
  expect(err.status).toBe(503)
  expect(describeError(err).title).toBe('Server MBTA sedang bermasalah')
})

it('not-found only hits the vehicle detail', async () => {
  const err = await failure('not-found', '/vehicles/y1')
  expect(describeError(err).title).toBe('Kendaraan tidak ditemukan')
  vi.stubGlobal('fetch', real())
  expect((await apiGet<{ id: string }[]>('/vehicles')).data[0].id).toBe('real')
})

it('bad-request is a 400 with a technical detail on the list', async () => {
  const err = await failure('bad-request', '/vehicles')
  expect(err.status).toBe(400)
  expect(describeError(err).technical).toContain('filter[route]')
})

it('empty succeeds with no vehicles', async () => {
  setSimulation('empty')
  vi.stubGlobal('fetch', real())
  expect((await apiGet('/vehicles')).data).toEqual([])
})

it('slow waits 4 seconds and then succeeds with real data', async () => {
  vi.useFakeTimers()
  setSimulation('slow')
  vi.stubGlobal('fetch', real())
  let done = false
  const p = apiGet<{ id: string }[]>('/vehicles').then((d) => ((done = true), d))
  await vi.advanceTimersByTimeAsync(SLOW_MS - 1)
  expect(done).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  expect((await p).data[0].id).toBe('real')
})

it('slow can be aborted', async () => {
  vi.useFakeTimers()
  setSimulation('slow')
  const c = new AbortController()
  const p = apiGet('/vehicles', {}, c.signal)
  c.abort()
  await expect(p).rejects.toMatchObject({ name: 'AbortError' })
})

it('map-fail rejects the map gate and nothing else does', async () => {
  await expect(mapGate()).resolves.toBeUndefined()
  setSimulation('map-fail')
  await expect(mapGate()).rejects.toThrow()
})
