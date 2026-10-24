import type { JsonApiError } from '../types/mbta'
import { getSimulation } from './simulate'

export class ApiError extends Error {
  kind: 'network' | 'http'
  status: number
  code: string
  detail: string

  constructor(kind: 'network' | 'http', status = 0, code = '', detail = '') {
    super(detail || code || kind)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.code = code
    this.detail = detail
  }

  static fromPayload(status: number, errors?: JsonApiError[]) {
    const first = errors?.[0]
    return new ApiError('http', status, first?.code ?? '', first?.detail ?? first?.title ?? '')
  }
}

export interface ErrorInfo {
  title: string
  message: string
  /** Raw detail from the API, shown small. */
  technical?: string
  /** Action label for the retry button. */
  action: string
}

/** The rate limit window is the calendar minute, and CORS hides x-ratelimit-reset. */
export function secondsToNextMinute(now = new Date()): number {
  return 60 - now.getSeconds()
}

export function describeError(err: unknown): ErrorInfo {
  const e = err instanceof ApiError ? err : new ApiError('network')
  if (e.kind === 'network') {
    return {
      title: 'Tidak ada koneksi internet',
      message: 'Periksa jaringan Anda. Data akan dimuat ulang otomatis saat koneksi kembali.',
      action: 'Coba lagi',
    }
  }
  if (e.status === 429) {
    return {
      title: 'Terlalu banyak permintaan',
      message: 'Server MBTA membatasi 20 permintaan per menit tanpa API key.',
      action: 'Coba lagi',
    }
  }
  if (e.status === 400) {
    return {
      title: 'Permintaan tidak valid',
      message: 'Coba atur ulang filter.',
      technical: e.detail || undefined,
      action: 'Coba lagi',
    }
  }
  if (e.status === 404) {
    return {
      title: 'Kendaraan tidak ditemukan',
      message: 'Kendaraan mungkin sudah selesai beroperasi.',
      action: 'Tutup',
    }
  }
  if (e.status >= 500) {
    return {
      title: 'Server MBTA sedang bermasalah',
      message: 'Biasanya pulih dalam beberapa menit.',
      action: 'Coba lagi',
    }
  }
  return {
    title: `Permintaan ditolak (kode ${e.status})`,
    message: 'Server menolak permintaan ini.',
    technical: e.detail || undefined,
    action: 'Coba lagi',
  }
}

/** TanStack Query `retry`: network and 5xx twice, 429 once, other 4xx never. */
export function shouldRetry(failureCount: number, err: unknown): boolean {
  // Simulated failures are deterministic, retrying would only delay the message.
  if (getSimulation()) return false
  if (!(err instanceof ApiError)) return failureCount < 2
  if (err.kind === 'network' || err.status >= 500) return failureCount < 2
  if (err.status === 429) return failureCount < 1
  return false
}
