import { expect, it } from 'vitest'
import { serviceDate } from './serviceDate'

it('uses Boston time, and the previous day before 03:00', () => {
  expect(serviceDate(Date.parse('2026-10-24T05:56:00Z'))).toBe('2026-10-23') // 01:56 EDT
  expect(serviceDate(Date.parse('2026-10-24T07:30:00Z'))).toBe('2026-10-24') // 03:30 EDT
  expect(serviceDate(Date.parse('2026-10-24T14:00:00Z'))).toBe('2026-10-24') // 10:00 EDT, already Oct 24 in WIB too
  expect(serviceDate(Date.parse('2026-12-01T04:30:00Z'))).toBe('2026-11-30') // 23:30 EST
})
