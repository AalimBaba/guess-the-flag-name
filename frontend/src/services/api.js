import axios from 'axios'
import { apiStatus, isGitHubPagesHost } from './apiConfig'

export const api = axios.create({
  baseURL: apiStatus.baseURL || undefined,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (!apiStatus.configured) {
    const error = new Error('API is not configured')
    error.code = 'API_NOT_CONFIGURED'
    return Promise.reject(error)
  }

  const target = new URL(config.url || '', config.baseURL)
  if (isGitHubPagesHost(target.hostname)) {
    const error = new Error('GitHub Pages cannot be used as the API server')
    error.code = 'INVALID_API_HOST'
    return Promise.reject(error)
  }

  return config
})
