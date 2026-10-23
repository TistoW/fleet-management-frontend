import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('menampilkan judul aplikasi', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Pantau Armada' })).toBeInTheDocument()
})
