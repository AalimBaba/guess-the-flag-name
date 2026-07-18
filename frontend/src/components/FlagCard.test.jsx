import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FlagCard from './FlagCard'

describe('FlagCard', () => {
  it('resolves local flag paths through the configured Vite base', () => {
    render(<FlagCard src="/flags/countries/US.svg" alt="United States" />)

    expect(screen.getByTestId('flag-image')).toHaveAttribute(
      'src',
      `${import.meta.env.BASE_URL}flags/countries/US.svg`
    )
  })

  it('preserves the flag label when the image cannot load', () => {
    render(<FlagCard src="/missing-flag.svg" alt="A very long historical flag name" />)

    fireEvent.error(screen.getByTestId('flag-image'))

    expect(screen.getByRole('img', { name: 'A very long historical flag name image unavailable' })).toBeInTheDocument()
    expect(screen.getByText('Flag image unavailable')).toBeInTheDocument()
  })
})
