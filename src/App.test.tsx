import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

it('menampilkan judul aplikasi dan jumlah kendaraan', async () => {
  const doc = {
    data: [
      {
        id: 'y1',
        type: 'vehicle',
        attributes: { label: '1841' },
        relationships: {},
      },
    ],
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(doc))))
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Pantau Armada' })).toBeInTheDocument()
  expect(await screen.findByText('1 kendaraan')).toBeInTheDocument()
})
