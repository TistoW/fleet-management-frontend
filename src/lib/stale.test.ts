import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { isStale } from './stale'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T10:00:00Z'))
})
afterEach(() => vi.useRealTimers())

it('is stale only after more than 5 minutes', () => {
  expect(isStale('2026-10-24T09:55:01Z')).toBe(false)
  expect(isStale('2026-10-24T09:55:00Z')).toBe(false) // exactly 5 minutes
  expect(isStale('2026-10-24T09:54:59Z')).toBe(true)
})

it('turns stale as time passes, and ignores unreadable dates', () => {
  expect(isStale('2026-10-24T09:58:00Z')).toBe(false)
  vi.advanceTimersByTime(4 * 60 * 1000)
  expect(isStale('2026-10-24T09:58:00Z')).toBe(true)
  expect(isStale('bukan tanggal')).toBe(false)
})
