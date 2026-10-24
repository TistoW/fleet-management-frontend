import { Icon } from '@iconify/react'
import { pageWindow } from '../lib/paginate'

interface Props {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const btn =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-sm font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-ink-muted disabled:opacity-50'
const idle = 'border-line bg-paper hover:bg-canvas disabled:hover:bg-paper'
const active = 'border-accent bg-accent text-white hover:bg-accent-strong'

export default function Pagination({ page, pageCount, onPageChange }: Props) {
  const first = page <= 1
  const last = page >= pageCount
  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center gap-3">
      <p className="hidden text-sm text-ink-muted tabular-nums 2xl:block">Halaman {page} dari {pageCount}</p>
      <div className="flex items-center gap-1">
        <button type="button" className={`${btn} ${idle} hidden sm:inline-flex`} disabled={first} onClick={() => onPageChange(1)} aria-label="Halaman pertama">
          <Icon icon="solar:double-alt-arrow-left-linear" className="size-4" aria-hidden />
        </button>
        <button type="button" className={`${btn} ${idle}`} disabled={first} onClick={() => onPageChange(page - 1)} aria-label="Sebelumnya">
          <Icon icon="solar:alt-arrow-left-linear" className="size-4" aria-hidden />
          <span className="ml-1 hidden sm:inline">Sebelumnya</span>
        </button>
        <span className="px-2 text-sm tabular-nums sm:hidden">{page} / {pageCount}</span>
        <div className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap${i}`} className="px-1 text-ink-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`${btn} ${p === page ? active : idle}`}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Halaman ${p}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button type="button" className={`${btn} ${idle}`} disabled={last} onClick={() => onPageChange(page + 1)} aria-label="Berikutnya">
          <span className="mr-1 hidden sm:inline">Berikutnya</span>
          <Icon icon="solar:alt-arrow-right-linear" className="size-4" aria-hidden />
        </button>
        <button type="button" className={`${btn} ${idle} hidden sm:inline-flex`} disabled={last} onClick={() => onPageChange(pageCount)} aria-label="Halaman terakhir">
          <Icon icon="solar:double-alt-arrow-right-linear" className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
