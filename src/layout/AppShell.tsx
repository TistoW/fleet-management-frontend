import { Icon } from '@iconify/react'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import BottomSheet from '../components/BottomSheet'
import Spinner from '../components/Spinner'
import type { View } from '../hooks/useUrlState'
import { formatClockWib } from '../lib/format'

const NAV: { view: View; label: string; short: string; icon: string; group: string }[] = [
  { view: 'kendaraan', label: 'Kendaraan', short: 'Kendaraan', icon: 'solar:bus-linear', group: 'Pantau' },
  { view: 'peta', label: 'Peta Armada', short: 'Peta', icon: 'solar:map-point-wave-linear', group: 'Pantau' },
  { view: 'data', label: 'Tentang Data', short: 'Info', icon: 'solar:database-linear', group: 'Info' },
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
  /** Phones: the app bar gets a filter button with a badge of active filters. */
  filter?: { count: number; onOpen: () => void }
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

export default function AppShell({ view, hrefFor, onNavigate, live, filter, children }: Props) {
  const [collapsed, setCollapsed] = useState(read)
  const [options, setOptions] = useState(false)
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

  const go = (v: View) => (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onNavigate(v)
  }

  const groups = [...new Set(NAV.map((n) => n.group))]
  const label = collapsed ? 'md:hidden' : ''

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <a
        href="#konten"
        className="fixed left-3 top-3 z-[60] -translate-y-20 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Lewati ke konten
      </a>
      <aside
        id="menu-utama"
        aria-label="Menu utama"
        className={[
          'hidden flex-col border-r border-line bg-paper md:flex md:transition-[width]',
          collapsed ? 'md:w-[68px]' : 'md:w-64',
        ].join(' ')}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent">
            <Icon icon="solar:bus-linear" className="size-4 text-white" aria-hidden />
          </span>
          <span className={`min-w-0 flex-1 truncate text-[15px] font-bold ${label}`}>Pantau Armada</span>
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

        <div className="shrink-0 border-t border-line p-2">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-14 shrink-0 items-center gap-x-4 border-b border-line bg-paper px-4 md:h-auto md:min-h-14 md:flex-wrap md:gap-y-1 md:px-6 md:py-2">
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold md:text-sm">{title}</h1>
          {live && <Toolbar {...live} />}
          {(live || filter) && (
            <div className="-mr-2 flex items-center md:hidden">
              {live && <IconButton label="Segarkan data" icon="solar:refresh-linear" spin={live.isFetching} onClick={live.onRefresh} />}
              {filter && <IconButton label="Filter" icon="solar:filter-linear" badge={filter.count} onClick={filter.onOpen} />}
              {live && <IconButton label="Opsi pembaruan" icon="solar:menu-dots-bold" onClick={() => setOptions(true)} />}
            </div>
          )}
          {live?.isFetching && live.updatedAt > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-accent-soft" aria-hidden>
              <div className="bar-slide h-full w-1/3 bg-accent" />
            </div>
          )}
        </header>
        <main id="konten" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
          <div
            className={`mx-auto flex max-w-7xl flex-col px-4 py-5 sm:px-6 ${view === 'data' ? 'min-h-full' : 'h-full'} ${
              view === 'peta' ? 'max-md:p-0' : 'max-md:pb-0 max-md:pt-3'
            }`}
          >
            {children}
          </div>
        </main>
        <nav
          aria-label="Menu bawah"
          className="flex shrink-0 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,.05)] md:hidden"
        >
          {NAV.map((n) => {
            const active = n.view === view
            return (
              <a
                key={n.view}
                href={hrefFor(n.view)}
                onClick={go(n.view)}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              >
                <span
                  className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-accent/15 text-accent' : 'text-ink-muted'
                  }`}
                >
                  <Icon icon={n.icon} className="size-6" aria-hidden />
                </span>
                <span className={active ? 'text-accent' : 'text-ink-muted'}>{n.short}</span>
              </a>
            )
          })}
        </nav>
      </div>
      {options && live && <OptionsSheet {...live} onClose={() => setOptions(false)} />}
    </div>
  )
}

function IconButton({ label, icon, onClick, badge, spin }: { label: string; icon: string; onClick: () => void; badge?: number; spin?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={badge ? `${label}, ${badge} aktif` : label}
      className="relative flex size-12 items-center justify-center rounded-full text-ink/80 active:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon icon={icon} className={`size-6 ${spin ? 'motion-safe:animate-spin' : ''}`} aria-hidden />
      {!!badge && (
        <span
          className="absolute right-1.5 top-1.5 flex size-[18px] items-center justify-center rounded-full bg-accent text-[11px] font-semibold leading-none text-white"
          aria-hidden
        >
          {badge}
        </span>
      )}
    </button>
  )
}

function OptionsSheet({ updatedAt, auto, onAuto, onClose }: Live & { onClose: () => void }) {
  return (
    <BottomSheet title="Pembaruan data" onClose={onClose}>
      <p className="mb-2 text-sm text-ink-muted tabular-nums">
        {updatedAt > 0 ? `Diperbarui ${formatClockWib(new Date(updatedAt).toISOString())} WIB` : 'Belum ada data'}
      </p>
      <label className="flex min-h-12 items-center justify-between gap-3 text-sm">
        Otomatis tiap 30 detik
        <input type="checkbox" checked={auto} onChange={(e) => onAuto(e.target.checked)} className="size-6 accent-accent" />
      </label>
    </BottomSheet>
  )
}

function Toolbar({ updatedAt, auto, onAuto, isFetching, onRefresh }: Live) {
  const [clicked, setClicked] = useState(false)
  const [done, setDone] = useState(false)
  const sawFetch = useRef(false)

  // "Muat ulang" answers with a short message once the request it started has finished.
  useEffect(() => {
    if (isFetching) sawFetch.current = true
    else if (clicked && sawFetch.current) {
      setClicked(false)
      setDone(true)
      const id = setTimeout(() => setDone(false), 2500)
      return () => clearTimeout(id)
    }
  }, [isFetching, clicked])

  return (
    <div className="hidden items-center gap-x-4 md:flex">
      <div className="flex items-center gap-x-4 text-sm text-ink-muted">
        {updatedAt > 0 && <span className="tabular-nums">Diperbarui {formatClockWib(new Date(updatedAt).toISOString())} WIB</span>}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={auto} onChange={(e) => onAuto(e.target.checked)} className="size-4 accent-accent" />
          Otomatis tiap 30 detik
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          sawFetch.current = false
          setClicked(true)
          setDone(false)
          onRefresh()
        }}
        disabled={isFetching}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm font-medium text-ink hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
      >
        {isFetching ? <Spinner /> : <Icon icon="solar:refresh-linear" className="size-4" aria-hidden />}
        Muat ulang
      </button>
      <span role="status" aria-live="polite" className="text-sm text-moving">
        {done ? 'Data sudah diperbarui' : ''}
      </span>
    </div>
  )
}
