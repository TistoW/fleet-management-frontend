import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import VehicleDetailModal from './VehicleDetailModal'

const detail = {
  data: {
    id: 'y1',
    type: 'vehicle',
    attributes: {
      label: '1841',
      current_status: 'STOPPED_AT',
      latitude: 42.37,
      longitude: -71.12,
      bearing: 270,
      speed: null,
      occupancy_status: 'FEW_SEATS_AVAILABLE',
      direction_id: 1,
      carriages: [],
      updated_at: '2026-10-22T23:14:52-04:00',
    },
    relationships: {
      route: { data: { id: 'Red', type: 'route' } },
      trip: { data: { id: 't1', type: 'trip' } },
      stop: { data: { id: 's1', type: 'stop' } },
    },
  },
  included: [
    {
      id: 'Red',
      type: 'route',
      attributes: { short_name: '', long_name: 'Red Line', color: 'DA291C', text_color: 'FFFFFF', type: 1, direction_names: ['South', 'North'] },
    },
    {
      id: 't1',
      type: 'trip',
      attributes: { headsign: 'Alewife', direction_id: 1, block_id: 'S931_-3', name: '', wheelchair_accessible: 1, bikes_allowed: 0 },
    },
    { id: 's1', type: 'stop', attributes: { name: 'JFK/UMass', platform_name: null, latitude: 42.32, longitude: -71.05 } },
  ],
}

beforeAll(() => {
  // jsdom has no <dialog> modal support.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})
afterEach(() => vi.unstubAllGlobals())

function setup(respond: () => Response) {
  vi.stubGlobal('fetch', vi.fn(async () => respond()))
  const onClose = vi.fn()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <VehicleDetailModal id="y1" onClose={onClose} />
    </QueryClientProvider>,
  )
  return onClose
}

it('shows a loading state, then route, trip and stop data', async () => {
  setup(() => new Response(JSON.stringify(detail)))
  expect(screen.getAllByRole('status', { name: 'Memuat detail' }).length).toBeGreaterThan(0)
  expect(await screen.findByText('Alewife')).toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: 'Kendaraan 1841' })).toBeInTheDocument()
  expect(screen.getByText('JFK/UMass')).toBeInTheDocument()
  expect(screen.getByText('North')).toBeInTheDocument()
  expect(screen.getByText('Sisa sedikit kursi')).toBeInTheDocument()
})

it('closes with the button, ESC and a backdrop click', async () => {
  const onClose = setup(() => new Response(JSON.stringify(detail)))
  await screen.findByText('Alewife')
  await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
  expect(onClose).toHaveBeenCalledTimes(1)
  screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }))
  expect(onClose).toHaveBeenCalledTimes(2)
  await userEvent.click(screen.getByRole('dialog'))
  expect(onClose).toHaveBeenCalledTimes(3)
})

it('shows an error with retry for an unknown vehicle', async () => {
  const onClose = setup(() => new Response(JSON.stringify({ errors: [{ code: 'not_found', status: '404' }] }), { status: 404 }))
  expect(await screen.findByText('Kendaraan tidak ditemukan')).toBeInTheDocument()
  await userEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Tutup' }))
  expect(onClose).toHaveBeenCalledTimes(1)
})
