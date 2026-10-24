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

it('shows the update time and the refresh controls in the top bar', async () => {
  render(<App />)
  await screen.findByText('Menampilkan 1-3 dari 3 kendaraan')
  expect(await screen.findByText(/Diperbarui \d{2}:\d{2}:\d{2} WIB/)).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Otomatis tiap 30 detik' })).toBeChecked()
  expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeInTheDocument()
})

it('opens the mobile drawer, traps Tab inside and closes on ESC and on the backdrop', async () => {
  render(<App />)
  const burger = screen.getByRole('button', { name: 'Buka menu' })
  const menu = screen.getByRole('complementary', { name: 'Menu utama' })
  expect(burger).toHaveAttribute('aria-expanded', 'false')

  await userEvent.click(burger)
  expect(burger).toHaveAttribute('aria-expanded', 'true')
  expect(menu).toContainElement(document.activeElement as HTMLElement)

  // Tab from the last control wraps to the first one.
  const items = menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  items[items.length - 1].focus()
  await userEvent.tab()
  expect(document.activeElement).toBe(items[0])
  await userEvent.tab({ shift: true })
  expect(document.activeElement).toBe(items[items.length - 1])

  await userEvent.keyboard('{Escape}')
  expect(burger).toHaveAttribute('aria-expanded', 'false')
  expect(document.activeElement).toBe(burger)

  await userEvent.click(burger)
  await userEvent.click(within(menu).getByRole('button', { name: 'Tutup menu' }))
  expect(burger).toHaveAttribute('aria-expanded', 'false')
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
