import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Profile from './Profile'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api: { get: mocks.get },
}))

vi.mock('../services/apiConfig', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, apiStatus: { baseURL: 'https://api.example.test/api', configured: true } }
})

describe('Profile', () => {
  beforeEach(() => {
    mocks.get.mockReset()
  })

  it('renders long identity details, stacked statistics, and recent games', async () => {
    mocks.get.mockResolvedValue({
      data: {
        username: 'Atlas Traveler With A Very Long Name',
        email: 'atlas.traveler.with.a.long.address@example.test',
        stats: { totalGames: 42, bestScore: 1880, avgAccuracy: 87 },
        recentGames: [
          {
            _id: 'game-1',
            mode: 'multiple choice',
            difficulty: 'hard',
            score: 1880,
            createdAt: '2026-07-18T08:30:00.000Z',
          },
        ],
      },
    })

    render(<Profile />)

    expect(await screen.findByRole('heading', { name: 'Atlas Traveler With A Very Long Name' })).toBeInTheDocument()
    expect(screen.getByText('atlas.traveler.with.a.long.address@example.test')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('1880')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('multiple choice | hard')).toBeInTheDocument()
  })
})
