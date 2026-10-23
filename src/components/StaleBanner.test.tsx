import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import StaleBanner from './StaleBanner'

const at = new Date('2026-10-23T07:02:05Z').getTime() // 14:02:05 WIB

it('names the time of the data still shown and retries on click', async () => {
  const onRetry = vi.fn()
  render(<StaleBanner updatedAt={at} countdown={null} onRetry={onRetry} />)
  expect(screen.getByRole('alert')).toHaveTextContent('Gagal memperbarui, menampilkan data terakhir pukul 14:02:05 WIB')
  expect(screen.queryByText(/Mencoba lagi/)).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
  expect(onRetry).toHaveBeenCalledOnce()
})

it('shows the rate limit countdown', () => {
  render(<StaleBanner updatedAt={at} countdown={12} onRetry={() => {}} />)
  expect(screen.getByRole('alert')).toHaveTextContent('Mencoba lagi dalam ±12 detik')
})
