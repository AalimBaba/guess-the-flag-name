import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { apiStatus, getApiErrorMessage, hasServerResponse } from '../services/apiConfig'

const AuthContext = createContext(null)
export default AuthContext

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(apiStatus.configured)
  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/me')
    setUser(data.user)
    setApiAvailable(true)
    return data.user
  }, [])

  useEffect(() => {
    let mounted = true
    api
      .get('/me')
      .then((res) => {
        if (mounted) {
          setUser(res.data.user)
          setApiAvailable(true)
        }
      })
      .catch((error) => {
        if (mounted) {
          setUser(null)
          setApiAvailable(hasServerResponse(error))
        }
      })
      .finally(() => {
        if (mounted) setReady(true)
      })
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email, password })
      setUser(data.user)
      setApiAvailable(true)
      return { ok: true }
    } catch (err) {
      setApiAvailable(hasServerResponse(err))
      return { ok: false, message: getApiErrorMessage(err, 'Login failed') }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/register', payload)
      setUser(data.user)
      setApiAvailable(true)
      return { ok: true }
    } catch (err) {
      setApiAvailable(hasServerResponse(err))
      return { ok: false, message: getApiErrorMessage(err, 'Registration failed') }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
      setApiAvailable(true)
    } catch (error) {
      setApiAvailable(hasServerResponse(error))
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, ready, apiAvailable, login, register, logout, refreshUser }),
    [user, loading, ready, apiAvailable, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

