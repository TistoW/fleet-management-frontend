import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { shouldRetry } from './api/errors'
import Spinner from './components/Spinner'
import VehicleDetailModal from './features/vehicles/VehicleDetailModal'
import VehiclesPage from './features/vehicles/VehiclesPage'
import { useFleet } from './hooks/useFleet'
import { buildSearch, type View } from './hooks/useUrlState'
import AppShell from './layout/AppShell'

// Leaflet stays out of the first load: the map view is its own chunk.
const FleetMapPage = lazy(() => import('./features/map/FleetMapPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, retry: shouldRetry, refetchOnWindowFocus: false },
  },
})

function Dashboard() {
  const { url, setUrl, auto, setAuto, fleet } = useFleet()
  const { data, isFetching, refetch, dataUpdatedAt } = fleet
  const hrefFor = (view: View) => buildSearch({ ...url, view, vehicle: null }) || window.location.pathname
  const pageProps = { url, setUrl, fleet }

  return (
    <AppShell
      view={url.view}
      hrefFor={hrefFor}
      onNavigate={(view) => setUrl({ view })}
      live={{ updatedAt: dataUpdatedAt, auto, onAuto: setAuto, isFetching, onRefresh: () => void refetch() }}
    >
      <Suspense
        fallback={
          <div role="status" aria-label="Memuat halaman" className="flex flex-1 items-center justify-center">
            <Spinner className="size-6 text-ink-muted" />
          </div>
        }
      >
        {url.view === 'kendaraan' && <VehiclesPage {...pageProps} />}
        {url.view === 'peta' && <FleetMapPage {...pageProps} />}
      </Suspense>
      {url.vehicle && (
        <VehicleDetailModal
          id={url.vehicle}
          preview={data?.find((x) => x.id === url.vehicle)}
          autoRefresh={auto}
          onClose={() => (window.history.state?.fromApp ? window.history.back() : setUrl({ vehicle: null }, { replace: true }))}
        />
      )}
    </AppShell>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
