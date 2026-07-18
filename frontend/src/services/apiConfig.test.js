import { describe, expect, it } from 'vitest'
import { ACCOUNTS_UNAVAILABLE_MESSAGE, getApiErrorMessage } from './apiConfig'

describe('API configuration errors', () => {
  it('uses the guest-play message for network failures', () => {
    expect(getApiErrorMessage(new Error('offline'), 'Registration failed')).toBe(ACCOUNTS_UNAVAILABLE_MESSAGE)
  })

  it('displays structured server validation messages', () => {
    const error = {
      response: {
        data: {
          errors: [{ path: ['password'], message: 'Must contain at least 8 characters' }],
        },
      },
    }

    expect(getApiErrorMessage(error, 'Registration failed')).toBe(
      'password: Must contain at least 8 characters'
    )
  })
})
