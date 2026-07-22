export const ACCOUNTS_UNAVAILABLE_MESSAGE =
  'Accounts are temporarily unavailable. Continue as a guest.'

export function isGitHubPagesHost(hostname) {
  return hostname === 'github.io' || hostname.endsWith('.github.io')
}

export function normalizeApiBaseUrl(value) {
  const candidate = value?.trim()
  if (!candidate) return ''

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    if (isGitHubPagesHost(url.hostname)) return ''
    return url.href.replace(/\/+$/, '')
  } catch {
    return ''
  }
}

const configuredBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

export const apiStatus = Object.freeze({
  baseURL: configuredBaseUrl,
  configured: Boolean(configuredBaseUrl),
})

export function hasServerResponse(error) {
  return Boolean(error?.response)
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (!hasServerResponse(error)) {
    return ACCOUNTS_UNAVAILABLE_MESSAGE
  }

  const errors = error.response?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    return errors
      .map((entry) => {
        const field = Array.isArray(entry.path) ? entry.path.join('.') : entry.path
        return field ? `${field}: ${entry.message}` : entry.message
      })
      .filter(Boolean)
      .join(' ')
  }

  return error.response?.data?.message || fallbackMessage
}
