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
