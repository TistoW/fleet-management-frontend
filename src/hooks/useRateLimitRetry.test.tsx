import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../api/errors'
import { retryDelayMs, useRateLimitRetry } from './useRateLimitRetry'

beforeEach(() => vi.useFakeTimers({ now: new Date('2026-10-23T06:00:40Z') }))
afterEach(() => vi.useRealTimers())

it('retryDelayMs waits for the next minute plus a margin', () => {
  expect(retryDelayMs(new Date('2026-10-23T06:00:40Z'))).toBe(20_500)
  expect(retryDelayMs(new Date('2026-10-23T06:00:00Z'))).toBe(60_500)
})

it('429: counts down and retries once at the minute boundary', () => {
  const retry = vi.fn()
  const { result } = renderHook(() => useRateLimitRetry(new ApiError('http', 429, 'rate_limited'), retry))
  expect(result.current).toBe(20)
  act(() => vi.advanceTimersByTime(5_000))
  expect(result.current).toBe(15)
  expect(retry).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(16_000))
  expect(retry).toHaveBeenCalledTimes(1)
})

it('other errors: no countdown and no automatic retry', () => {
  const retry = vi.fn()
  const { result } = renderHook(() => useRateLimitRetry(new ApiError('http', 503), retry))
  act(() => vi.advanceTimersByTime(70_000))
  expect(result.current).toBeNull()
  expect(retry).not.toHaveBeenCalled()
})
