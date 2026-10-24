import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

it('menampilkan judul aplikasi dan rentang data', async () => {
  const doc = {
    data: [
      {
        id: 'y1',
        type: 'vehicle',
        attributes: { label: '1841', current_status: 'STOPPED_AT', latitude: 42.37, longitude: -71.12, updated_at: '2026-10-22T23:14:52-04:00' },
        relationships: {},
      },
    ],
  }
  vi.stubGlobal('fetch', vi.fn(async (url: URL) =>
      new Response(JSON.stringify(url.pathname === '/routes' ? { data: [] } : doc)),
    ))
  render(<App />)
  expect(screen.getByText('Pantau Armada')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Kendaraan' })).toBeInTheDocument()
  expect(await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')).toBeInTheDocument()
})
