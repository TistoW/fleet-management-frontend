import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyDoc, vehicleDoc } from '../test/fixtures'
import type { Resource } from '../types/mbta'
import { indexIncluded, offsetFromLink, pickIncluded, relId } from './jsonapi'
import { fetchRoutesPage } from './routes'
import { fetchVehicles } from './vehicles'

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })

afterEach(() => vi.unstubAllGlobals())

describe('jsonapi helpers', () => {
  const vehicle = vehicleDoc.data[0] as Resource<unknown>

  it('indexIncluded keys by type:id and tolerates undefined', () => {
    const map = indexIncluded([{ id: 'Red', type: 'route', attributes: {} }])
    expect(map.get('route:Red')?.id).toBe('Red')
    expect(indexIncluded(undefined).size).toBe(0)
  })

  it('relId returns the id, or null for data: null or missing relationship', () => {
    expect(relId(vehicle, 'trip')).toBe('78266427')
    expect(relId({ ...vehicle, relationships: { trip: { data: null } } }, 'trip')).toBeNull()
    expect(relId({ ...vehicle, relationships: undefined }, 'trip')).toBeNull()
  })

  it('pickIncluded finds by type and id', () => {
    const map = indexIncluded([{ id: '109', type: 'route', attributes: { long_name: 'x' } }])
    expect(pickIncluded(map, 'route', '109')?.id).toBe('109')
    expect(pickIncluded(map, 'route', null)).toBeUndefined()
    expect(pickIncluded(map, 'stop', '109')).toBeUndefined()
  })

  it('offsetFromLink reads encoded and unencoded brackets', () => {
    expect(offsetFromLink('https://api-v3.mbta.com/routes?page[limit]=30&page[offset]=60')).toBe(60)
    expect(offsetFromLink('https://api-v3.mbta.com/routes?page%5Blimit%5D=30&page%5Boffset%5D=90')).toBe(90)
  })

  it('offsetFromLink returns null without a link or offset', () => {
    expect(offsetFromLink(undefined)).toBeNull()
    expect(offsetFromLink('https://api-v3.mbta.com/routes?page[limit]=30')).toBeNull()
  })
})

describe('fetchers', () => {
  it('fetchVehicles joins the included route and tolerates a missing trip', async () => {
    const doc = {
      data: [vehicleDoc.data[0]],
      included: [
        {
          id: '109',
          type: 'route',
          attributes: { short_name: '109', long_name: 'Linden Square', color: 'FFC72C', text_color: '000000', type: 3 },
        },
      ],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(doc)))
    const [v] = await fetchVehicles({ routes: ['109'] })
    expect(v).toMatchObject({ id: 'y2105', label: '2105', status: 'STOPPED_AT', routeId: '109', tripId: '78266427' })
    expect(v.route).toMatchObject({ name: '109', color: '#FFC72C' })
  })

  it('fetchVehicles handles an empty response without links', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(emptyDoc)))
    expect(await fetchVehicles()).toEqual([])
  })

  it('fetchRoutesPage returns nextOffset from links.next and null on the last page', async () => {
    const route = { id: 'Red', type: 'route', attributes: { short_name: '', long_name: 'Red Line', color: 'DA291C', text_color: 'FFFFFF', type: 1 } }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ data: [route], links: { next: 'https://x/routes?page[offset]=30' } }))
      .mockResolvedValueOnce(json({ data: [route], links: { first: 'https://x/routes?page[offset]=0' } }))
    vi.stubGlobal('fetch', fetchMock)
    const first = await fetchRoutesPage(0)
    expect(first.nextOffset).toBe(30)
    expect(first.items[0].name).toBe('Red Line')
    expect((await fetchRoutesPage(30)).nextOffset).toBeNull()
  })
})
