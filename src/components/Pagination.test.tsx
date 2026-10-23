import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { rangeText } from '../lib/paginate'
import Pagination from './Pagination'

it('teks rentang', () => {
  expect(rangeText(11, 20, 330)).toBe('Menampilkan 11-20 dari 330 kendaraan')
  expect(rangeText(0, 0, 0)).toBe('Tidak ada data')
})

it('menampilkan jumlah halaman dan menandai halaman aktif', () => {
  render(<Pagination page={5} pageCount={33} onPageChange={() => {}} />)
  expect(screen.getByText('Halaman 5 dari 33')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Halaman 5' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: 'Halaman 33' })).toBeInTheDocument()
})

it('Sebelumnya dan Pertama nonaktif di halaman 1, Berikutnya nonaktif di terakhir', () => {
  const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Halaman pertama' })).toBeDisabled()
  rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeDisabled()
})

it('klik nomor, berikutnya, dan terakhir memanggil onPageChange', async () => {
  const onPageChange = vi.fn()
  render(<Pagination page={2} pageCount={10} onPageChange={onPageChange} />)
  await userEvent.click(screen.getByRole('button', { name: 'Halaman 4' }))
  await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }))
  await userEvent.click(screen.getByRole('button', { name: 'Halaman terakhir' }))
  expect(onPageChange.mock.calls).toEqual([[4], [3], [10]])
})
