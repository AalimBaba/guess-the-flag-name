import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api: apiMocks,
}))

function OfflineAuthHarness() {
  const { ready, apiAvailable, login, register, logout, refreshUser } = useAuth()

  return (
    <div>
      <span>{ready ? 'ready' : 'loading'}</span>
      <span>{apiAvailable ? 'api available' : 'guest only'}</span>
      <button type="button" onClick={() => login('guest@example.test', 'NotSent1!')}>Login</button>
      <button
        type="button"
        onClick={() => register({ username: 'Guest', email: 'guest@example.test', password: 'NotSent1!' })}
      >
        Register
      </button>
      <button type="button" onClick={logout}>Logout</button>
      <button type="button" onClick={refreshUser}>Refresh</button>
    </div>
  )
}

describe('AuthProvider without VITE_API_URL', () => {
  beforeEach(() => {
    apiMocks.get.mockReset()
    apiMocks.post.mockReset()
  })

  it('becomes guest-ready and keeps every account action local', async () => {
    render(
      <AuthProvider>
        <OfflineAuthHarness />
      </AuthProvider>
    )

    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(screen.getByText('guest only')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }))
      fireEvent.click(screen.getByRole('button', { name: 'Register' }))
      fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
      fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    })

    expect(apiMocks.get).not.toHaveBeenCalled()
    expect(apiMocks.post).not.toHaveBeenCalled()
  })
})
