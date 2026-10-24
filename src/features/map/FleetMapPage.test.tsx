import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import App from '../../App'
import { stubFleetFetch } from '../../test/fleetStub'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
  Tooltip: () => null,
  Marker: ({ title, eventHandlers }: { title: string; eventHandlers?: { click: () => void } }) => (
    <button type="button" data-testid="marker" onClick={eventHandlers?.click}>
      {title}
    </button>
  ),
  useMap: () => ({ fitBounds: vi.fn(), invalidateSize: vi.fn(), getContainer: () => document.body, getZoom: () => 11, setView: vi.fn(), panTo: vi.fn() }),
}))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})
beforeEach(() => {
  window.history.replaceState(null, '', '/?view=peta&route=Red')
  stubFleetFetch()
})
afterEach(() => vi.unstubAllGlobals())

it('shows the filtered fleet on the map with a legend, and opens the popup from a marker', async () => {
  const fetchMock = stubFleetFetch()
  render(<App />)
  const markers = await screen.findAllByTestId('marker')
  expect(markers).toHaveLength(2)
  expect(screen.getByText('2 kendaraan di peta')).toBeInTheDocument()
  expect(screen.getAllByText('RL').length).toBeGreaterThan(0)

  // One vehicles request feeds the map; the filter dropdowns bring their own routes request.
  const vehicleCalls = fetchMock.mock.calls.filter(([u]) => (u as URL).pathname === '/vehicles')
  expect(vehicleCalls).toHaveLength(1)

  await userEvent.click(markers[0])
  expect(window.location.search).toBe('?route=Red&vehicle=y1&view=peta')
  expect(await screen.findByRole('dialog', { name: /Kendaraan 1841/ })).toBeInTheDocument()
})

it('says so when no vehicle has a position', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: URL) => new Response(JSON.stringify(url.pathname === '/vehicles' ? { data: [] } : { data: [] }))))
  window.history.replaceState(null, '', '/?view=peta&route=Blue')
  render(<App />)
  expect(await screen.findByText('Belum ada kendaraan di peta')).toBeInTheDocument()
})
