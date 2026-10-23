import { expect, it } from 'vitest'
import { pageAfterSizeChange, pageWindow, paginate } from './paginate'

const items = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

it('halaman pertama: 1-5 dari 10', () => {
  const r = paginate(items(10), 1, 5)
  expect(r).toMatchObject({ from: 1, to: 5, total: 10, pageCount: 2, page: 1 })
  expect(r.pageItems).toEqual([1, 2, 3, 4, 5])
})

it('halaman terakhir parsial: 11-12 dari 12', () => {
  const r = paginate(items(12), 2, 10)
  expect(r).toMatchObject({ from: 11, to: 12, total: 12, pageCount: 2 })
  expect(r.pageItems).toEqual([11, 12])
})

it('total 0: from=0, to=0, pageCount=1', () => {
  expect(paginate([], 1, 10)).toMatchObject({ from: 0, to: 0, total: 0, pageCount: 1, page: 1, pageItems: [] })
})

it('page di luar batas di-clamp', () => {
  expect(paginate(items(25), 99, 10).page).toBe(3)
  expect(paginate(items(25), 0, 10).page).toBe(1)
  expect(paginate(items(25), -4, 10).page).toBe(1)
  expect(paginate(items(25), NaN, 10).page).toBe(1)
})

it('mengganti ukuran menjaga item pertama tetap terlihat', () => {
  expect(pageAfterSizeChange(41, 10)).toBe(5)
  expect(pageAfterSizeChange(41, 50)).toBe(1)
  expect(pageAfterSizeChange(0, 10)).toBe(1)
})

it('pageWindow memakai elipsis', () => {
  expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
  expect(pageWindow(1, 33)).toEqual([1, 2, 3, 4, 5, '…', 33])
  expect(pageWindow(5, 33)).toEqual([1, '…', 4, 5, 6, '…', 33])
  expect(pageWindow(33, 33)).toEqual([1, '…', 29, 30, 31, 32, 33])
})
