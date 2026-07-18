export const ACCOUNTS_UNAVAILABLE_MESSAGE =
  'Accounts are temporarily unavailable. You can continue as a guest.'

function normalizeBaseUrl(value) {
  return value?.trim().replace(/\/+$/, '') || ''
}

const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL)
const developmentBaseUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : ''
const baseURL = configuredBaseUrl || developmentBaseUrl

export const apiStatus = Object.freeze({
  baseURL,
  configured: Boolean(baseURL),
  usesDevelopmentFallback: !configuredBaseUrl && Boolean(developmentBaseUrl),
})

export function hasServerResponse(error) {
  return Boolean(error?.response)
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (!apiStatus.configured || !hasServerResponse(error)) {
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
