import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../../App'
import { mixedFleetDoc, stubFleetFetch } from '../../test/fleetStub'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  localStorage.clear()
  stubFleetFetch(mixedFleetDoc)
})
afterEach(() => vi.unstubAllGlobals())

it('counts the fleet in the stat cards from the loaded data', async () => {
  render(<App />)
  await screen.findByRole('button', { name: /^\d+\s*Total kendaraan$/ })
  const stats = screen.getByRole('list', { name: 'Ringkasan armada' })
  const value = (label: string) => within(stats).getByText(label).previousElementSibling?.textContent
  expect(value('Total kendaraan')).toBe('4')
  expect(value('Sedang berjalan')).toBe('3')
  expect(value('Berhenti di halte')).toBe('1')
  expect(value('Rute aktif')).toBe('1')
})

it('filters by a stat card, shows it as a removable chip and clears it', async () => {
  render(<App />)
  await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')

  await userEvent.click(screen.getByRole('button', { name: /^\d+\s*Berhenti di halte$/ }))
  expect(screen.getByRole('button', { name: /^\d+\s*Berhenti di halte$/ })).toHaveAttribute('aria-pressed', 'true')
  expect(await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')).toBeInTheDocument()
  expect(window.location.search).toBe('?status=berhenti')
  expect(screen.getByText('1 filter aktif')).toBeInTheDocument()
  // The counts stay those of the whole fleet, so the cards can be used to switch.
  expect(screen.getByRole('button', { name: /^\d+\s*Total kendaraan$/ })).toHaveTextContent('4')

  await userEvent.click(screen.getByRole('button', { name: 'Hapus Berhenti di halte' }))
  expect(await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')).toBeInTheDocument()
  expect(screen.queryByText(/filter aktif/)).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /^\d+\s*Sedang berjalan$/ }))
  expect(await screen.findByText('Menampilkan 1-3 dari 3 kendaraan')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Hapus semua' }))
  expect(await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')).toBeInTheDocument()
})

it('jumps to the map focused on a vehicle and keeps the status filter', async () => {
  window.history.replaceState(null, '', '/?status=berhenti')
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Lihat di peta' }))
  expect(window.location.search).toBe('?status=berhenti&focus=m3&view=peta')
})

it('mencari lewat kotak cari: URL ?q=, jumlah, chip, dan hapus', async () => {
  render(<App />)
  await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')
  await userEvent.type(screen.getByRole('searchbox', { name: 'Cari kendaraan' }), '2003')
  expect(await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')).toBeInTheDocument()
  expect(window.location.search).toBe('?q=2003')
  // Stat cards follow the searched set.
  expect(screen.getByRole('button', { name: /^\d+\s*Total kendaraan$/ })).toHaveTextContent('1')
  expect(screen.getByText('Cari: “2003”')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Hapus Cari: “2003”' }))
  expect(await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')).toBeInTheDocument()
  expect(window.location.search).toBe('')
  expect(screen.getByRole('searchbox', { name: 'Cari kendaraan' })).toHaveValue('')
})

it('mencari tujuan (headsign) dan rute, bersama filter status', async () => {
  window.history.replaceState(null, '', '/?q=alewife')
  render(<App />)
  expect(await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')).toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: 'Cari kendaraan' })).toHaveValue('alewife')
  await userEvent.click(screen.getByRole('button', { name: /^\d+\s*Berhenti di halte$/ }))
  expect(await screen.findByText("Tidak ada kendaraan yang cocok dengan 'alewife'")).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Hapus pencarian', description: '' }))
  expect(await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')).toBeInTheDocument()
  expect(window.location.search).toBe('?status=berhenti')
})

it('Esc mengosongkan pencarian dan "/" memfokuskannya', async () => {
  window.history.replaceState(null, '', '/?q=2001')
  render(<App />)
  await screen.findByText('Menampilkan 1-1 dari 1 kendaraan')
  const box = screen.getByRole('searchbox', { name: 'Cari kendaraan' })
  await userEvent.click(document.body)
  await userEvent.keyboard('/')
  expect(box).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  expect(await screen.findByText('Menampilkan 1-4 dari 4 kendaraan')).toBeInTheDocument()
  expect(box).toHaveValue('')
})
