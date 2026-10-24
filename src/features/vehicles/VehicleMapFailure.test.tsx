import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, expect, it, vi } from 'vitest'
import VehicleDetailModal from './VehicleDetailModal'

let fail = true
vi.mock('./VehicleMap', () => {
  if (fail) throw new Error('chunk failed')
  return { default: () => <div>peta</div> }
})

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

it('keeps the popup usable when the map chunk fails, and retry loads the map', async () => {
  const body = { data: { id: 'y1', type: 'vehicle', attributes: { label: '1841', latitude: 42.3, longitude: -71.1, current_status: 'STOPPED_AT', updated_at: '2026-10-22T23:14:52-04:00', carriages: [] }, relationships: {} } }
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body))))
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <VehicleDetailModal id="y1" onClose={() => {}} />
    </QueryClientProvider>,
  )
  expect(await screen.findByText('Peta gagal dimuat')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tutup' })).toBeInTheDocument()
  fail = false
  await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
  expect(await screen.findByText('peta')).toBeInTheDocument()
  vi.unstubAllGlobals()
})
