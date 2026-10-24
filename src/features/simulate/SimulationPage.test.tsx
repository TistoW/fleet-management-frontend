import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../../App'
import { stubFleetFetch } from '../../test/fleetStub'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  localStorage.clear()
  stubFleetFetch()
})
afterEach(() => vi.unstubAllGlobals())

const nav = () => screen.getByRole('navigation', { name: 'Halaman' })

// First on purpose: App keeps one QueryClient per module, so cached vehicles from other tests would hide the error.
it('opens with a mode from the address, which survives navigation, and shows nothing when inactive', async () => {
  window.history.replaceState(null, '', '/?simulate=offline')
  render(<App />)
  expect(await screen.findByText('Tidak ada koneksi internet')).toBeInTheDocument()
  await userEvent.click(within(nav()).getByRole('link', { name: 'Peta Armada' }))
  expect(window.location.search).toBe('?view=peta&simulate=offline')
})

it('lists every scenario with a preview of its real message, reachable from the Info menu', async () => {
  render(<App />)
  await userEvent.click(within(nav()).getByRole('link', { name: 'Simulasi Kendala' }))
  expect(window.location.search).toBe('?view=simulasi')
  expect(await screen.findByText(/Halaman ini untuk mendemokan pesan error/)).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /^Coba:/ })).toHaveLength(9)
  expect(screen.getByText('Server MBTA sedang bermasalah')).toBeInTheDocument()
})

it('Coba turns a mode on, shows its message on Kendaraan, and the banner turns it off again', async () => {
  window.history.replaceState(null, '', '/?view=simulasi')
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Coba: Server MBTA bermasalah' }))
  expect(window.location.search).toBe('?simulate=server')
  const alert = await screen.findByRole('alert')
  expect(within(alert).getByText('Server MBTA sedang bermasalah')).toBeInTheDocument()
  expect(screen.getByText(/Mode simulasi:/)).toHaveTextContent('Mode simulasi: Server MBTA bermasalah aktif')

  await userEvent.click(screen.getByRole('button', { name: 'Matikan simulasi' }))
  expect(window.location.search).toBe('')
  expect(screen.queryByText(/Mode simulasi:/)).not.toBeInTheDocument()
  expect(await screen.findByText('Menampilkan 1-3 dari 3 kendaraan')).toBeInTheDocument()
})

it('opens the popup for popup scenarios', async () => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  window.history.replaceState(null, '', '/?view=simulasi')
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Coba: Kendaraan tidak ditemukan' }))
  expect(window.location.search).toContain('simulate=not-found')
  expect(window.location.search).toContain('vehicle=')
  expect((await screen.findAllByText('Kendaraan tidak ditemukan')).length).toBeGreaterThan(0)
})
