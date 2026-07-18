export function publicAssetUrl(path, base = import.meta.env.BASE_URL) {
  if (!path) return ''

  const value = String(path).trim()
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value

  const baseSegment = String(base || '/')
    .replace(/^\/+|\/+$/g, '')
  const assetPath = value.replace(/^(?:\.\/|\/)+/, '')

  if (baseSegment && assetPath.startsWith(`${baseSegment}/`)) {
    return `/${assetPath}`
  }

  return `${baseSegment ? `/${baseSegment}/` : '/'}${assetPath}`
}
