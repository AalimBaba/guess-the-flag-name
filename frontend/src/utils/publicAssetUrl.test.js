import { describe, expect, it } from 'vitest'
import { publicAssetUrl } from './publicAssetUrl'

describe('publicAssetUrl', () => {
  const pagesBase = '/guess-the-flag-name/'

  it.each([
    '/flags/countries/CZ.svg',
    '/flags/states/MD.svg',
    '/flags/cities/prague.svg',
    '/flags/historical/venice-republic.svg',
    '/assets/flag-fallback.svg',
    '/audio/atlas-ambient.wav',
  ])('prefixes %s with the GitHub Pages base', (path) => {
    expect(publicAssetUrl(path, pagesBase)).toBe(`${pagesBase}${path.replace(/^\//, '')}`)
  })

  it('does not duplicate an existing base path', () => {
    expect(publicAssetUrl('/guess-the-flag-name/flags/countries/CZ.svg', pagesBase)).toBe(
      '/guess-the-flag-name/flags/countries/CZ.svg'
    )
  })

  it('leaves external and data URLs unchanged', () => {
    expect(publicAssetUrl('https://example.test/flag.svg', pagesBase)).toBe('https://example.test/flag.svg')
    expect(publicAssetUrl('data:image/svg+xml;base64,PHN2Zy8+', pagesBase)).toBe(
      'data:image/svg+xml;base64,PHN2Zy8+'
    )
  })
})
