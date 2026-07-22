import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ThemeToggle from './ThemeToggle'

describe('ThemeToggle', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the system preference on first visit', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })

    render(<ThemeToggle />)

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })

  it('persists a selected theme across remounts', async () => {
    localStorage.setItem('theme', 'light')
    const firstRender = render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(localStorage.getItem('theme')).toBe('dark')

    firstRender.unmount()
    render(<ThemeToggle />)

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })
})
