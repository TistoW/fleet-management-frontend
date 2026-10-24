import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lazy, useEffect } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Suspense } from 'react'
import ProviderMap from './ProviderMap'
import { initialProvider } from './provider'

const Osm = lazy(async () => ({ default: () => <div>peta-osm</div> }))
const Google = lazy(async () => ({ default: () => <div>peta-google</div> }))
function Failing({ onFail }: { onFail: () => void }) {
  useEffect(onFail, [onFail])
  return <div>peta-rusak</div>
}
const Broken = lazy(async () => ({ default: Failing }))

const show = (G: typeof Google | typeof Broken) =>
  render(
    <Suspense fallback={null}>
      <ProviderMap Osm={Osm} Google={G as typeof Google} mapProps={{}} />
    </Suspense>,
  )

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllEnvs())

it('picks OSM unless a key exists and the user chose Google', () => {
  expect(initialProvider(undefined, 'google')).toBe('osm')
  expect(initialProvider('k', null)).toBe('osm')
  expect(initialProvider('k', 'google')).toBe('google')
})

it('without a key: OSM only, no switch', async () => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '')
  show(Google)
  expect(await screen.findByText('peta-osm')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Google Maps' })).toBeNull()
})

it('with a key: starts on OSM, loads Google only after switching, and remembers it', async () => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  show(Google)
  expect(await screen.findByText('peta-osm')).toBeInTheDocument()
  expect(screen.queryByText('peta-google')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Google Maps' }))
  expect(await screen.findByText('peta-google')).toBeInTheDocument()
  expect(localStorage.getItem('map-provider')).toBe('google')
})

it('falls back to OSM with a note when Google fails', async () => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  show(Broken)
  await userEvent.click(await screen.findByRole('button', { name: 'Google Maps' }))
  expect(await screen.findByText('peta-osm')).toBeInTheDocument()
  expect(await screen.findByRole('status')).toHaveTextContent('Google Maps tidak tersedia, kembali ke OpenStreetMap')
  expect(localStorage.getItem('map-provider')).toBe('osm')
})
