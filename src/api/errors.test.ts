import { describe, expect, it } from 'vitest'
import { rateLimitedError } from '../test/fixtures'
import { ApiError, describeError, secondsToNextMinute, shouldRetry } from './errors'

const http = (status: number, detail = '') => new ApiError('http', status, '', detail)

describe('describeError', () => {
  it('network', () => {
    expect(describeError(new ApiError('network')).title).toBe('Tidak ada koneksi internet')
  })
  it('429', () => {
    const e = ApiError.fromPayload(429, rateLimitedError.errors)
    expect(e.code).toBe('rate_limited')
    expect(describeError(e).title).toBe('Terlalu banyak permintaan')
  })
  it('400 keeps the API detail as technical info', () => {
    const info = describeError(http(400, 'At least one filter[] is required.'))
    expect(info.title).toBe('Permintaan tidak valid')
    expect(info.technical).toBe('At least one filter[] is required.')
  })
  it('404', () => {
    expect(describeError(http(404)).title).toBe('Kendaraan tidak ditemukan')
  })
  it('503', () => {
    expect(describeError(http(503)).title).toBe('Server MBTA sedang bermasalah')
  })
  it('other 4xx includes the code', () => {
    expect(describeError(http(403)).title).toBe('Permintaan ditolak (kode 403)')
  })
})

describe('secondsToNextMinute', () => {
  it('counts to the next calendar minute', () => {
    expect(secondsToNextMinute(new Date('2026-10-23T10:00:45Z'))).toBe(15)
    expect(secondsToNextMinute(new Date('2026-10-23T10:00:00Z'))).toBe(60)
  })
})

describe('shouldRetry', () => {
  it('network and 5xx twice', () => {
    expect(shouldRetry(1, new ApiError('network'))).toBe(true)
    expect(shouldRetry(2, new ApiError('network'))).toBe(false)
    expect(shouldRetry(1, http(503))).toBe(true)
  })
  it('429 once', () => {
    expect(shouldRetry(0, http(429))).toBe(true)
    expect(shouldRetry(1, http(429))).toBe(false)
  })
  it('other 4xx never', () => {
    expect(shouldRetry(0, http(404))).toBe(false)
  })
})
