/** A GPS fix older than this is flagged as "GPS tidak update". */
export const STALE_AFTER_MS = 5 * 60 * 1000

export function isStale(updatedAt: string, now = Date.now()): boolean {
  const t = new Date(updatedAt).getTime()
  return !Number.isNaN(t) && now - t > STALE_AFTER_MS
}
