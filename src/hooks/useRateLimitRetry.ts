import { useEffect, useRef, useState } from 'react'
import { ApiError, secondsToNextMinute } from '../api/errors'

/** Wait until the next calendar minute (the rate limit window) plus a small margin. */
export const retryDelayMs = (now = new Date()) => secondsToNextMinute(now) * 1000 + 500

/**
 * On a 429, counts down to the next minute boundary and calls `retry` once there.
 * Returns the seconds left, or null when the error is not a rate limit.
 */
export function useRateLimitRetry(error: unknown, retry: () => void): number | null {
  const limited = error instanceof ApiError && error.status === 429
  const [seconds, setSeconds] = useState(() => secondsToNextMinute())
  const retryRef = useRef(retry)
  useEffect(() => {
    retryRef.current = retry
  })

  useEffect(() => {
    if (!limited) return
    const tick = setInterval(() => setSeconds(secondsToNextMinute()), 1000)
    const retryTimer = setTimeout(() => retryRef.current(), retryDelayMs())
    return () => {
      clearInterval(tick)
      clearTimeout(retryTimer)
    }
  }, [limited, error])

  return limited ? seconds : null
}
