import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import type { VehicleView } from '../../api/vehicles'
import FleetMap from './FleetMap'

const fitBounds = vi.fn()
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ title, eventHandlers }: { title: string; eventHandlers: { click: () => void } }) => (
    <button type="button" data-testid="marker" onClick={eventHandlers.click}>
      {title}
    </button>
  ),
  useMap: () => ({ fitBounds, invalidateSize: vi.fn(), getContainer: () => document.body }),
}))

const v = (id: string, label: string, lat: number | null, lng: number | null): VehicleView => ({
  id,
  label,
  status: 'IN_TRANSIT_TO',
  lat,
  lng,
  updatedAt: '2026-10-22T23:14:52-04:00',
  directionId: 0,
  bearing: 45,
  occupancy: null,
  routeId: 'Red',
  tripId: null,
  route: { id: 'Red', name: 'RL', longName: 'Red Line', color: '#DA291C', textColor: '#FFFFFF', type: 1, directionNames: [], description: '' },
})

it('draws a marker per vehicle that has a position, opens it on click and fits once per filter', async () => {
  const onOpen = vi.fn()
  const list = [v('y1', '1841', 42.37, -71.12), v('y2', '1842', 42.38, -71.1), v('y3', '1843', null, null)]
  const { rerender } = render(<FleetMap vehicles={list} fitKey="a" onOpen={onOpen} />)
  const markers = screen.getAllByTestId('marker')
  expect(markers).toHaveLength(2)
  expect(markers[0]).toHaveTextContent('Kendaraan 1841, RL')
  await userEvent.click(markers[1])
  expect(onOpen).toHaveBeenCalledWith('y2')
  expect(fitBounds).toHaveBeenCalledTimes(1)
  rerender(<FleetMap vehicles={[...list]} fitKey="a" onOpen={onOpen} />)
  expect(fitBounds).toHaveBeenCalledTimes(1)
  rerender(<FleetMap vehicles={list} fitKey="b" onOpen={onOpen} />)
  expect(fitBounds).toHaveBeenCalledTimes(2)
})
