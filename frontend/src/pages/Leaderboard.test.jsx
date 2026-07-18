import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Leaderboard from './Leaderboard'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api: { get: mocks.get },
}))

vi.mock('../context/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 'user-1', username: 'Atlas Traveler' } }),
}))

describe('Leaderboard', () => {
  beforeEach(() => {
    mocks.get.mockReset()
  })

  it('renders populated mobile cards and the desktop table with long names', async () => {
    mocks.get.mockResolvedValue({
      data: [
        { userId: 'user-1', username: 'Atlas Traveler With A Very Long Name', score: 1840 },
        { userId: 'user-2', username: 'Second Cartographer', score: 920 },
      ],
    })

    render(<Leaderboard />)

    const repeatedName = await screen.findAllByText('Atlas Traveler With A Very Long Name')
    expect(repeatedName).toHaveLength(2)

    const mobileEntries = screen.getByLabelText('Leaderboard entries')
    expect(within(mobileEntries).getAllByRole('article')).toHaveLength(2)
    expect(within(mobileEntries).getByText('1840 points')).toBeInTheDocument()

    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Player' })).toBeInTheDocument()
    expect(within(table).getByText('Second Cartographer')).toBeInTheDocument()
  })
})
