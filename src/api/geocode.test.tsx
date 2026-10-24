import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useStreetName } from '../hooks/useStreetName'
import { fromNominatim, fromPhoton, reverseGeocode } from './geocode'

afterEach(() => vi.unstubAllGlobals())

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

it('formats Photon and Nominatim answers as "road, area"', () => {
  expect(fromPhoton({ features: [{ properties: { street: 'Beacon St', district: 'Back Bay' } }] })).toBe('Beacon St, Back Bay')
  expect(fromPhoton({ features: [] })).toBeNull()
  expect(fromNominatim({ address: { road: 'Jl. Sudirman', suburb: 'Tanah Abang' } })).toBe('Jl. Sudirman, Tanah Abang')
  expect(fromNominatim({ address: { road: 'Main St', city: 'Main St' } })).toBe('Main St')
})

it('uses Photon alone when it answers', async () => {
  const f = vi.fn(async () => json({ features: [{ properties: { street: 'Beacon St', city: 'Boston' } }] }))
  vi.stubGlobal('fetch', f)
  expect(await reverseGeocode(42.35, -71.07)).toBe('Beacon St, Boston')
  expect(f).toHaveBeenCalledTimes(1)
})

it('falls back to Nominatim with Accept-Language id, and gives null when both fail', async () => {
  const f = vi.fn(async (url: string) =>
    url.includes('photon') ? json({}, 500) : json({ address: { road: 'Jl. Thamrin', suburb: 'Menteng' } }),
  )
  vi.stubGlobal('fetch', f)
  expect(await reverseGeocode(-6.19, 106.82)).toBe('Jl. Thamrin, Menteng')
  const init = f.mock.calls[1] as unknown as [string, RequestInit]
  expect(init[1].headers).toEqual({ 'Accept-Language': 'id' })

  vi.stubGlobal('fetch', vi.fn(async () => json({}, 500)))
  expect(await reverseGeocode(1, 1)).toBeNull()
})

it('asks once per ~100 m: a small move reuses the cached answer, a real move asks again', async () => {
  const f = vi.fn(async () => json({ features: [{ properties: { street: 'Beacon St' } }] }))
  vi.stubGlobal('fetch', f)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  )
  const { result, rerender } = renderHook(({ lat }) => useStreetName(lat, -71.0712), { wrapper, initialProps: { lat: 42.3501 } })
  await waitFor(() => expect(result.current.data).toBe('Beacon St'))
  rerender({ lat: 42.3504 })
  expect(f).toHaveBeenCalledTimes(1)
  rerender({ lat: 42.3601 })
  await waitFor(() => expect(f).toHaveBeenCalledTimes(2))
})
