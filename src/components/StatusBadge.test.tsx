import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import StatusBadge from './StatusBadge'

it('shows the Indonesian label, keeps the API value only as a tooltip', () => {
  render(<StatusBadge status="STOPPED_AT" />)
  expect(screen.getByText('Berhenti di halte')).toHaveAttribute('title', 'Status API: STOPPED_AT')
  expect(screen.queryByText('STOPPED_AT')).not.toBeInTheDocument()
})
