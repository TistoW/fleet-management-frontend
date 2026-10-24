import { ApiError } from './errors'
import { simulatedFetch } from './simulate'
import type { JsonApiDoc, JsonApiError } from '../types/mbta'

const BASE_URL = 'https://api-v3.mbta.com'

export type Params = Record<string, string | number | undefined>

export async function apiGet<T>(
  path: string,
  params: Params = {},
  signal?: AbortSignal,
): Promise<JsonApiDoc<T>> {
  const url = new URL(path, BASE_URL)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }

  const headers: Record<string, string> = { Accept: 'application/vnd.api+json' }
  const key = import.meta.env.VITE_MBTA_API_KEY
  if (key) headers['x-api-key'] = key

  let res: Response
  try {
    res = (await simulatedFetch(url.pathname, signal)) ?? (await fetch(url, { headers, signal }))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('network')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { errors?: JsonApiError[] } | null
    throw ApiError.fromPayload(res.status, body?.errors)
  }
  return (await res.json()) as JsonApiDoc<T>
}
