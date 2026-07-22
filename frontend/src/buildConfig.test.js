import { describe, expect, it } from 'vitest'
import viteConfig from '../vite.config'

describe('production build configuration', () => {
  it('loads without requiring VITE_API_URL', () => {
    expect(viteConfig).toMatchObject({ base: '/guess-the-flag-name/' })
  })
})
