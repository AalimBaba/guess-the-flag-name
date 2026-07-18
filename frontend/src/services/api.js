import axios from 'axios'
import { apiStatus } from './apiConfig'

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
  return config
})
