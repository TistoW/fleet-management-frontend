export interface PageResult<T> {
  pageItems: T[]
  /** 1-based, 0 when there is no data. */
  from: number
  to: number
  total: number
  pageCount: number
  /** The requested page clamped to [1, pageCount]. */
  page: number
}

export function paginate<T>(items: T[], page: number, size: number): PageResult<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / size))
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pageCount)
  const start = (p - 1) * size
  const pageItems = items.slice(start, start + size)
  return {
    pageItems,
    from: total === 0 ? 0 : start + 1,
    to: start + pageItems.length,
    total,
    pageCount,
    page: p,
  }
}

/** Keep the first item on screen when the page size changes. */
export function pageAfterSizeChange(from: number, newSize: number): number {
  return Math.floor(Math.max(from - 1, 0) / newSize) + 1
}

/** Page numbers with ellipsis: 1 … 4 5 6 … 33. */
export function pageWindow(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, Math.min(page - 1, pageCount - 4))
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5))
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < pageCount - 1) out.push('…')
  out.push(pageCount)
  return out
}

export function rangeText(from: number, to: number, total: number): string {
  return total === 0 ? 'Tidak ada data' : `Menampilkan ${from}-${to} dari ${total} kendaraan`
}
