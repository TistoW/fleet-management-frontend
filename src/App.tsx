import { Icon } from '@iconify/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { shouldRetry } from './api/errors'
import VehiclesPage from './features/vehicles/VehiclesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, retry: shouldRetry, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <VehiclesPage />
        </main>
      </div>
    </QueryClientProvider>
  )
}
