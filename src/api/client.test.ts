import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyDoc, rateLimitedError, vehicleDoc } from '../test/fixtures'
import { apiGet } from './client'
import { ApiError } from './errors'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('apiGet', () => {
  it('builds JSON:API params and sends the Accept header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(vehicleDoc))
    vi.stubGlobal('fetch', fetchMock)
    const doc = await apiGet('/vehicles', {
      'page[limit]': 5,
      'filter[route]': 'Red,1',
      skip: undefined,
    })
    const [url, init] = fetchMock.mock.calls[0]
    const u = new URL(url)
    expect(u.searchParams.get('page[limit]')).toBe('5')
    expect(u.searchParams.get('filter[route]')).toBe('Red,1')
    expect(u.searchParams.has('skip')).toBe(false)
    expect(init.headers.Accept).toBe('application/vnd.api+json')
    expect(init.headers['x-api-key']).toBeUndefined()
    expect(doc).toEqual(vehicleDoc)
  })

  it('adds x-api-key when VITE_MBTA_API_KEY is set', async () => {
    vi.stubEnv('VITE_MBTA_API_KEY', 'abc')
    const fetchMock = vi.fn().mockResolvedValue(json(emptyDoc))
    vi.stubGlobal('fetch', fetchMock)
    await apiGet('/vehicles')
    expect(fetchMock.mock.calls[0][1].headers['x-api-key']).toBe('abc')
  })

  it('throws ApiError from an errors[] payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(rateLimitedError, 429)))
    await expect(apiGet('/vehicles')).rejects.toMatchObject({
      kind: 'http',
      status: 429,
      code: 'rate_limited',
    })
  })

  it('maps fetch TypeError to a network ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const err = await apiGet('/vehicles').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.kind).toBe('network')
  })
})
