// Sample payloads copied from real api-v3.mbta.com responses (23 Okt 2026).
export const vehicleDoc = {
  data: [
    {
      id: 'y2105',
      type: 'vehicle',
      attributes: {
        bearing: 270,
        carriages: [],
        current_status: 'STOPPED_AT',
        current_stop_sequence: 1,
        direction_id: 0,
        label: '2105',
        latitude: 42.37271,
        longitude: -71.12298,
        occupancy_status: 'MANY_SEATS_AVAILABLE',
        revenue: 'REVENUE',
        speed: null,
        updated_at: '2026-10-22T23:14:52-04:00',
      },
      relationships: {
        route: { data: { id: '109', type: 'route' } },
        stop: { data: { id: '76125', type: 'stop' } },
        trip: { data: { id: '78266427', type: 'trip' } },
      },
    },
  ],
  links: {
    first: 'https://api-v3.mbta.com/vehicles?page[limit]=5&page[offset]=0',
    last: 'https://api-v3.mbta.com/vehicles?page[limit]=5&page[offset]=325',
    next: 'https://api-v3.mbta.com/vehicles?page[limit]=5&page[offset]=5',
  },
  jsonapi: { version: '1.0' },
}

export const emptyDoc = { data: [], jsonapi: { version: '1.0' } }

export const rateLimitedError = {
  errors: [
    {
      code: 'rate_limited',
      status: '429',
      source: { parameter: 'api_key' },
      detail: 'You have exceeded your allowed usage rate.',
    },
  ],
}
