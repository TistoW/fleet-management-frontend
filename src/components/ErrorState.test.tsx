import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ApiError } from '../api/errors'
import ErrorState from './ErrorState'

it('jaringan: pesan offline dan tombol Coba lagi memanggil onRetry', async () => {
  const onRetry = vi.fn()
  render(<ErrorState error={new ApiError('network')} onRetry={onRetry} />)
  expect(screen.getByRole('alert')).toHaveTextContent('Tidak ada koneksi internet')
  await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
  expect(onRetry).toHaveBeenCalledOnce()
})

it('429: menampilkan hitung mundur', () => {
  render(<ErrorState error={new ApiError('http', 429, 'rate_limited')} onRetry={() => {}} />)
  expect(screen.getByText('Terlalu banyak permintaan')).toBeInTheDocument()
  expect(screen.getByText(/Coba lagi dalam ±\d+ detik/)).toBeInTheDocument()
})

it('400: detail teknis dari API ditampilkan kecil', () => {
  render(<ErrorState error={new ApiError('http', 400, 'bad_request', 'Invalid sort key.')} onRetry={() => {}} />)
  expect(screen.getByText('Permintaan tidak valid')).toBeInTheDocument()
  expect(screen.getByText('Invalid sort key.')).toBeInTheDocument()
})

it('5xx: pesan server bermasalah', () => {
  render(<ErrorState error={new ApiError('http', 503)} onRetry={() => {}} />)
  expect(screen.getByText('Server MBTA sedang bermasalah')).toBeInTheDocument()
})
