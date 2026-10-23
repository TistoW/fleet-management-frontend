import { Icon } from '@iconify/react'

export default function App() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Icon icon="solar:bus-bold-duotone" className="size-7 text-accent" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Pantau Armada</h1>
            <p className="text-sm text-ink-muted">Data langsung MBTA, Boston</p>
          </div>
        </div>
      </header>
    </div>
  )
}
