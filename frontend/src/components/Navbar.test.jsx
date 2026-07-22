import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from './Navbar'

const auth = vi.hoisted(() => ({
  user: null,
  ready: true,
  logout: vi.fn(),
}))

vi.mock('../context/useAuth.js', () => ({
  useAuth: () => auth,
}))

vi.mock('./ThemeToggle', () => ({
  default: () => <button type="button" aria-label="Switch to dark mode" />,
}))

vi.mock('./SoundToggle', () => ({
  default: () => <button type="button" aria-label="Play background music" />,
}))

function renderNavbar(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar mobile navigation', () => {
  beforeEach(() => {
    auth.user = null
    auth.ready = true
    auth.logout.mockReset()
  })

  it('opens, exposes every guest destination, and closes with Escape', () => {
    renderNavbar()
    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })

    fireEvent.click(trigger)
    const menu = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(within(menu).getByRole('link', { name: 'Play' })).toHaveAttribute('aria-current', 'page')
    expect(within(menu).getByRole('link', { name: 'Leaderboard' })).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: 'Register' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()
  })

  it('keeps profile and logout available for authenticated users', async () => {
    auth.user = { id: 'traveler-1', username: 'Atlas Traveler' }
    auth.logout.mockResolvedValue(undefined)
    renderNavbar('/profile')

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const menu = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(within(menu).getByRole('link', { name: 'Atlas Traveler' })).toHaveAttribute('aria-current', 'page')

    await act(async () => {
      fireEvent.click(within(menu).getByRole('button', { name: 'Logout' }))
    })
    expect(auth.logout).toHaveBeenCalledOnce()
  })
})
