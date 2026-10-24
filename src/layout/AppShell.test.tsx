import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../App'
import { stubFleetFetch } from '../test/fleetStub'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  localStorage.clear()
  stubFleetFetch()
})
afterEach(() => vi.unstubAllGlobals())

it('switches pages from the sidebar, keeps the filters and drops the popup', async () => {
  window.history.replaceState(null, '', '/?route=Red&vehicle=y1')
  render(<App />)
  const nav = screen.getByRole('navigation', { name: 'Halaman' })
  expect(within(nav).getByRole('link', { name: 'Kendaraan' })).toHaveAttribute('aria-current', 'page')
  expect(await screen.findByText('Menampilkan 1-3 dari 3 kendaraan')).toBeInTheDocument()

  // The link itself carries the filters, so it also works when opened in a new tab.
  const peta = within(nav).getByRole('link', { name: 'Peta Armada' })
  expect(peta).toHaveAttribute('href', '?route=Red&view=peta')
  await userEvent.click(peta)
  expect(window.location.search).toBe('?route=Red&view=peta')
  expect(await screen.findByRole('heading', { name: 'Peta Armada' })).toBeInTheDocument()
  expect(within(nav).getByRole('link', { name: 'Peta Armada' })).toHaveAttribute('aria-current', 'page')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await userEvent.click(within(nav).getByRole('link', { name: 'Tentang Data' }))
  expect(await screen.findByRole('heading', { name: 'Sumber data' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Muat ulang' })).not.toBeInTheDocument()

  await userEvent.click(within(nav).getByRole('link', { name: 'Kendaraan' }))
  expect(window.location.search).toBe('?route=Red')
  expect(await screen.findByRole('button', { name: 'Muat ulang' })).toBeInTheDocument()
})

it('shows the update time and the refresh controls in the top bar', async () => {
  render(<App />)
  await screen.findByText('Menampilkan 1-3 dari 3 kendaraan')
  expect(await screen.findByText(/Diperbarui \d{2}:\d{2}:\d{2} WIB/)).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Otomatis tiap 30 detik' })).toBeChecked()
  expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeInTheDocument()
})

const phone = () =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: true, media: q, addEventListener: () => {}, removeEventListener: () => {} }))

it('switches pages from the bottom navigation and marks the active tab', async () => {
  render(<App />)
  const tabs = screen.getByRole('navigation', { name: 'Menu bawah' })
  expect(within(tabs).getByRole('link', { name: 'Kendaraan' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(within(tabs).getByRole('link', { name: 'Peta' }))
  expect(window.location.search).toBe('?view=peta')
  expect(within(tabs).getByRole('link', { name: 'Peta' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(within(tabs).getByRole('link', { name: 'Info' }))
  expect(window.location.search).toBe('?view=data')
  expect(await screen.findByRole('heading', { name: 'Sumber data' })).toBeInTheDocument()
})

it('opens the filter sheet from the app bar, keeps focus inside and closes on ESC and on Terapkan', async () => {
  phone()
  render(<App />)
  await screen.findByText('1-3 dari 3')
  const open = screen.getByRole('button', { name: 'Filter' })
  await userEvent.click(open)
  const sheet = screen.getByRole('dialog', { name: 'Filter' })
  expect(sheet).toContainElement(document.activeElement as HTMLElement)
  expect(within(sheet).getByRole('button', { name: /^Rute/ })).toBeInTheDocument()

  const items = sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select')
  items[items.length - 1].focus()
  await userEvent.tab()
  expect(document.activeElement).toBe(items[0])

  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filter' }))

  await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
  await userEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('Reset in the filter sheet clears the filters and the badge follows the count', async () => {
  phone()
  window.history.replaceState(null, '', '/?route=Red&status=berjalan')
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Filter, 2 aktif' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Filter, 2 aktif' }))
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(window.location.search).toBe('')
  expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument()
})

it('moves the update time and the auto-refresh switch into the options sheet on phones', async () => {
  phone()
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'Opsi pembaruan' }))
  const sheet = screen.getByRole('dialog', { name: 'Pembaruan data' })
  expect(within(sheet).getByRole('checkbox', { name: 'Otomatis tiap 30 detik' })).toBeChecked()
  await userEvent.click(within(sheet).getByRole('button', { name: 'Tutup' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('collapses the sidebar to icons and remembers the choice', async () => {
  const first = render(<App />)
  await userEvent.click(screen.getByRole('button', { name: 'Ciutkan menu' }))
  expect(screen.getByRole('button', { name: 'Lebarkan menu' })).toHaveAttribute('aria-expanded', 'false')
  expect(localStorage.getItem('sidebar-collapsed')).toBe('1')
  first.unmount()
  render(<App />)
  expect(screen.getByRole('button', { name: 'Lebarkan menu' })).toBeInTheDocument()
})
