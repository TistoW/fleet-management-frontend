import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import MultiSelect, { type Option } from './MultiSelect'

const OPTIONS: Option[] = [
  { value: 'Red', label: 'Red Line', description: 'Rapid Transit' },
  { value: 'Blue', label: 'Blue Line', description: 'Rapid Transit' },
  { value: '39', label: '39', description: 'Key Bus' },
]

type Callback = (entries: { isIntersecting: boolean }[]) => void
let observers: { cb: Callback; disconnect: () => void }[] = []

beforeEach(() => {
  observers = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      cb: Callback
      constructor(cb: Callback) {
        this.cb = cb
        observers.push(this)
      }
      observe() {}
      disconnect() {}
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

function Harness(props: Partial<React.ComponentProps<typeof MultiSelect>> & { initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(props.initial ?? [])
  return (
    <MultiSelect
      label="Route"
      options={OPTIONS}
      {...props}
      selected={selected}
      onChange={(v) => {
        setSelected(v)
        props.onChange?.(v)
      }}
    />
  )
}

const open = async () => {
  await userEvent.click(screen.getByRole('button', { name: /^Route:/ }))
  return screen.getByRole('combobox', { name: 'Cari Route' })
}

it('klik membuka listbox multi-select dan fokus pindah ke kolom cari', async () => {
  render(<Harness />)
  const box = await open()
  expect(box).toHaveFocus()
  expect(screen.getByRole('listbox', { name: 'Route' })).toHaveAttribute('aria-multiselectable', 'true')
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('panah bawah + Enter memilih, Spasi mencabut pilihan', async () => {
  const onChange = vi.fn()
  render(<Harness onChange={onChange} />)
  const box = await open()
  expect(box).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id)
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(onChange).toHaveBeenLastCalledWith(['Blue'])
  expect(screen.getByRole('option', { name: /Blue Line/ })).toHaveAttribute('aria-selected', 'true')
  await userEvent.keyboard(' ')
  expect(onChange).toHaveBeenLastCalledWith([])
  await userEvent.keyboard('{End}{Enter}')
  expect(onChange).toHaveBeenLastCalledWith(['39'])
})

it('chip tampil, dihapus lewat tombolnya dan lewat Backspace', async () => {
  const onChange = vi.fn()
  render(<Harness initial={['Red', 'Blue']} onChange={onChange} />)
  expect(screen.getByRole('list', { name: 'Route terpilih' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Hapus Red Line' }))
  expect(onChange).toHaveBeenLastCalledWith(['Blue'])
  expect(screen.queryByRole('button', { name: 'Hapus Red Line' })).not.toBeInTheDocument()

  await open()
  await userEvent.keyboard('{Backspace}')
  expect(onChange).toHaveBeenLastCalledWith([])
})

it('Esc menutup dan fokus kembali ke tombol pemicu', async () => {
  render(<Harness />)
  await open()
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Route:/ })).toHaveFocus()
})

it('pencarian memfilter item yang sudah dimuat', async () => {
  render(<Harness />)
  await open()
  await userEvent.keyboard('blue')
  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
  expect(screen.getByRole('option', { name: /Blue Line/ })).toBeInTheDocument()
  await userEvent.clear(screen.getByRole('combobox'))
  await userEvent.keyboard('zzz')
  expect(await screen.findByText(/Tidak ada hasil untuk "zzz" di 3 item/)).toBeInTheDocument()
})

it('sentinel yang terlihat memanggil onLoadMore', async () => {
  const onLoadMore = vi.fn()
  render(<Harness hasMore onLoadMore={onLoadMore} />)
  await open()
  expect(observers.length).toBeGreaterThan(0)
  observers.at(-1)!.cb([{ isIntersecting: false }])
  expect(onLoadMore).not.toHaveBeenCalled()
  observers.at(-1)!.cb([{ isIntersecting: true }])
  expect(onLoadMore).toHaveBeenCalledOnce()
})

it('tidak memuat lagi saat tidak ada halaman berikutnya', async () => {
  render(<Harness hasMore={false} onLoadMore={vi.fn()} />)
  await open()
  expect(observers).toHaveLength(0)
})

it('tombol dinonaktifkan menampilkan petunjuk', () => {
  render(<Harness disabled disabledHint="Pilih route dulu" />)
  expect(screen.getByRole('button', { name: /^Route:/ })).toBeDisabled()
  expect(screen.getByText('Pilih route dulu')).toBeInTheDocument()
})

it('error menampilkan tombol Coba lagi', async () => {
  const onRetry = vi.fn()
  render(<Harness options={[]} error="Gagal memuat" onRetry={onRetry} />)
  await open()
  await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
  expect(onRetry).toHaveBeenCalledOnce()
})
