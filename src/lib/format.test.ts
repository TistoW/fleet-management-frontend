import { expect, it } from 'vitest'
import { formatClockWib, formatRelative } from './format'

it('mengubah waktu Boston ke WIB', () => {
  expect(formatClockWib('2026-10-22T23:14:52-04:00')).toBe('10:14:52')
})

it('waktu relatif dalam bahasa Indonesia', () => {
  const now = Date.parse('2026-10-22T23:20:00-04:00')
  expect(formatRelative('2026-10-22T23:19:55-04:00', now)).toBe('baru saja')
  expect(formatRelative('2026-10-22T23:14:52-04:00', now)).toBe('5 menit yang lalu')
})

it('formats the ETA of an upcoming stop', async () => {
  const { formatEta } = await import('./format')
  const now = Date.parse('2026-10-24T10:00:00Z')
  const at = (sec: number) => new Date(now + sec * 1000).toISOString()
  expect(formatEta(at(-120), now)).toBe('baru lewat')
  expect(formatEta(at(20), now)).toBe('sebentar lagi')
  expect(formatEta(at(5 * 60), now)).toBe('5 mnt lagi')
  expect(formatEta(at(75 * 60), now)).toBe('1 j 15 mnt lagi')
  expect(formatEta('nope', now)).toBe('')
})
