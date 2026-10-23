import { expect, it } from 'vitest'
import { statusInfo } from './status'

it('memetakan tiga status GTFS-RT ke label Indonesia', () => {
  expect(statusInfo('IN_TRANSIT_TO').label).toBe('Menuju halte')
  expect(statusInfo('INCOMING_AT').label).toBe('Segera tiba')
  expect(statusInfo('STOPPED_AT').label).toBe('Berhenti di halte')
})

it('nilai tak dikenal dan null jatuh ke status tidak diketahui', () => {
  expect(statusInfo('SOMETHING_NEW').label).toBe('Status tidak diketahui')
  expect(statusInfo(null).label).toBe('Status tidak diketahui')
})
