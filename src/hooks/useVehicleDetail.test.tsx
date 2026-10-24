import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useVehicleDetail } from './useVehicleDetail'

afterEach(() => vi.useRealTimers())

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
)

it('polls every 30 seconds only when auto refresh is on', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify({ data: { id: 'x', type: 'vehicle', attributes: {}, relationships: {} } })))
  vi.stubGlobal('fetch', fetchMock)
  const on = renderHook(() => useVehicleDetail('y1', true), { wrapper })
  const off = renderHook(() => useVehicleDetail('y2', false), { wrapper })
  await waitFor(() => expect(on.result.current.isSuccess && off.result.current.isSuccess).toBe(true))
  const count = (id: string) => fetchMock.mock.calls.filter((c) => String(c[0]).includes(id)).length
  expect(count('y1')).toBe(1)
  await vi.advanceTimersByTimeAsync(31_000)
  expect(count('y1')).toBe(2)
  expect(count('y2')).toBe(1)
  vi.unstubAllGlobals()
})
