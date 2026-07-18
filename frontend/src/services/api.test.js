import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

describe('unconfigured API client', () => {
  const originalAdapter = api.defaults.adapter

  afterEach(() => {
    api.defaults.adapter = originalAdapter
  })

  it('rejects protected endpoints before a network adapter is reached', async () => {
    const adapter = vi.fn()
    api.defaults.adapter = adapter

    for (const [method, path] of [
      ['get', '/me'],
      ['post', '/login'],
      ['post', '/register'],
      ['post', '/logout'],
      ['get', '/profile'],
      ['post', '/game/save'],
      ['get', '/leaderboard'],
    ]) {
      await expect(api[method](path)).rejects.toMatchObject({ code: 'API_NOT_CONFIGURED' })
    }

    expect(adapter).not.toHaveBeenCalled()
  })
})
