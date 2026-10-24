import { Icon } from '@iconify/react'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import Spinner from '../components/Spinner'
import type { View } from '../hooks/useUrlState'
import { formatClockWib } from '../lib/format'

const NAV: { view: View; label: string; icon: string; group: string }[] = [
  { view: 'kendaraan', label: 'Kendaraan', icon: 'solar:bus-bold', group: 'Pantau' },
]

export interface Live {
  updatedAt: number
  auto: boolean
  onAuto: (on: boolean) => void
  isFetching: boolean
  onRefresh: () => void
}

interface Props {
  view: View
  /** Search string (with leading ?) that opens a view and keeps the filters. */
  hrefFor: (view: View) => string
  onNavigate: (view: View) => void
  /** Status and refresh controls; left out on pages that show no live data. */
  live?: Live
  children: ReactNode
}

const STORE = 'sidebar-collapsed'
const read = () => {
  try {
    return localStorage.getItem(STORE) === '1'
  } catch {
    return false
  }
}

const FOCUSABLE = 'a[href], button:not([disabled])'

export default function AppShell({ view, hrefFor, onNavigate, live, children }: Props) {
  const [collapsed, setCollapsed] = useState(read)
  const [drawer, setDrawer] = useState(false)
  const aside = useRef<HTMLElement>(null)
  const burger = useRef<HTMLButtonElement>(null)
  const title = NAV.find((n) => n.view === view)?.label ?? ''

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(STORE, next ? '1' : '0')
    } catch {
      // storage can be blocked; the choice then lasts for this visit only
    }
  }

  // Off-canvas drawer (phones): focus moves in, Tab stays inside, ESC or a wider screen closes it.
  useEffect(() => {
    if (!drawer) return
    const el = aside.current
    const opener = burger.current
    el?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setDrawer(false)
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onResize = () => window.innerWidth >= 768 && setDrawer(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      opener?.focus()
    }
  }, [drawer])

  const go = (v: View) => (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    setDrawer(false)
    onNavigate(v)
  }

  const groups = [...new Set(NAV.map((n) => n.group))]
  const label = collapsed ? 'md:hidden' : ''

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      {drawer && <div className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={() => setDrawer(false)} aria-hidden />}
      <aside
        ref={aside}
        id="menu-utama"
        aria-label="Menu utama"
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-paper shadow-2xl transition-[transform,visibility] duration-200',
          'md:static md:z-auto md:translate-x-0 md:shadow-none md:transition-[width]',
          collapsed ? 'md:w-[68px]' : 'md:w-64',
          drawer ? 'translate-x-0' : 'invisible -translate-x-full md:visible',
        ].join(' ')}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent">
            <Icon icon="solar:bus-bold" className="size-4 text-white" aria-hidden />
          </span>
          <span className={`min-w-0 flex-1 truncate text-[15px] font-bold ${label}`}>Pantau Armada</span>
          <button
            type="button"
            onClick={() => setDrawer(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1 text-ink-muted hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          >
            <Icon icon="solar:close-circle-bold" className="size-6" aria-hidden />
          </button>
        </div>

        <nav aria-label="Halaman" className="flex-1 overflow-y-auto px-2 py-3 text-sm">
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className={`mb-1 px-2.5 text-xs font-medium text-ink-muted ${label}`}>{g}</p>
              <ul className="space-y-0.5">
                {NAV.filter((n) => n.group === g).map((n) => {
                  const active = n.view === view
                  return (
                    <li key={n.view}>
                      <a
                        href={hrefFor(n.view)}
                        onClick={go(n.view)}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? n.label : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          collapsed ? 'md:justify-center' : ''
                        } ${active ? 'bg-accent/10 font-medium text-accent' : 'text-ink/80 hover:bg-ink/5'}`}
                      >
                        <Icon icon={n.icon} className="size-[18px] shrink-0" aria-hidden />
                        <span className={label}>{n.label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 border-t border-line p-2 md:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Lebarkan menu' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon
              icon={collapsed ? 'solar:double-alt-arrow-right-linear' : 'solar:double-alt-arrow-left-linear'}
              className="size-[18px] shrink-0"
              aria-hidden
            />
            {!collapsed && 'Ciutkan menu'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col" inert={drawer}>
        <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-paper px-4 py-2 sm:px-6 md:min-h-14">
          <button
            ref={burger}
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Buka menu"
            aria-expanded={drawer}
            aria-controls="menu-utama"
            className="-ml-1 rounded-lg p-1.5 text-ink/70 hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          >
            <Icon icon="solar:hamburger-menu-bold" className="size-5" aria-hidden />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h1>
          {live && <Toolbar {...live} />}
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

function Toolbar({ updatedAt, auto, onAuto, isFetching, onRefresh }: Live) {
  return (
    <>
      {/* On phones the status line drops to its own row under the title and the button. */}
      <div className="flex items-center gap-x-4 text-sm text-ink-muted max-sm:order-last max-sm:w-full max-sm:justify-between">
        {updatedAt > 0 && <span className="tabular-nums">Diperbarui {formatClockWib(new Date(updatedAt).toISOString())} WIB</span>}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={auto} onChange={(e) => onAuto(e.target.checked)} className="size-4 accent-accent" />
          Otomatis tiap 30 detik
        </label>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
      >
        {isFetching ? <Spinner /> : <Icon icon="solar:refresh-bold" className="size-4" aria-hidden />}
        Muat ulang
      </button>
    </>
  )
}
