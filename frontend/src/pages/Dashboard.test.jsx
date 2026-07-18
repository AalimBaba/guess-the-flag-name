import { StrictMode } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from './Dashboard'

vi.mock('../context/useAuth.js', () => ({
  useAuth: () => ({ user: null, ready: true }),
}))

function renderDashboard() {
  return render(
    <StrictMode>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </StrictMode>
  )
}

describe('Dashboard game lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts once, renders the first flag, and starts one timer', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))
    expect(screen.getByTestId('flag-image')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByTestId('timer-value')).toHaveTextContent('01:29')
  })

  it('resets only when a configuration value changes', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))
    expect(screen.getByTestId('flag-image')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Flag collection' }), {
      target: { value: 'states' },
    })

    expect(screen.queryByTestId('flag-image')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Run' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))
    expect(screen.getByTestId('flag-image')).toHaveAttribute('src', expect.stringContaining('/flags/states/'))
  })

  it('starts all collections in both answer modes', () => {
    renderDashboard()
    const collectionSelect = screen.getByRole('combobox', { name: 'Flag collection' })
    const modeSelect = screen.getByRole('combobox', { name: 'Answer mode' })

    for (const collection of ['nations', 'states', 'historical', 'cities']) {
      for (const mode of ['typing', 'multiple']) {
        fireEvent.change(collectionSelect, { target: { value: collection } })
        fireEvent.change(modeSelect, { target: { value: mode } })
        fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))
        expect(screen.getByTestId('flag-image')).toBeInTheDocument()
        if (mode === 'typing') expect(screen.getByRole('textbox', { name: 'Flag answer' })).toBeInTheDocument()
        else expect(within(screen.getByTestId('answer-options')).getAllByRole('button').length).toBeGreaterThan(1)

        fireEvent.change(screen.getByRole('combobox', { name: 'Difficulty' }), {
          target: { value: screen.getByRole('combobox', { name: 'Difficulty' }).value === 'easy' ? 'medium' : 'easy' },
        })
      }
    }
  })

  it('advances without repeating the previous flag', () => {
    renderDashboard()
    fireEvent.change(screen.getByRole('combobox', { name: 'Answer mode' }), {
      target: { value: 'multiple' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))

    const firstFlag = screen.getByTestId('flag-image').getAttribute('alt')
    fireEvent.click(within(screen.getByTestId('answer-options')).getAllByRole('button')[0])
    act(() => vi.advanceTimersByTime(1100))

    expect(screen.getByTestId('flag-image')).not.toHaveAttribute('alt', firstFlag)
    expect(screen.getByText('Round 2 of 10')).toBeInTheDocument()
  })

  it('starts a fresh flag when Play Again is selected', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }))

    act(() => vi.advanceTimersByTime(90000))
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))
    expect(screen.getByTestId('flag-image')).toBeInTheDocument()
    expect(screen.queryByText('Run complete')).not.toBeInTheDocument()
    expect(screen.getByTestId('timer-value')).toHaveTextContent('01:30')
  })
})
