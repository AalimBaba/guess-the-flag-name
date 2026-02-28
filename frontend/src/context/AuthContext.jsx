import { createContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../services/api'

const AuthContext = createContext(null)
export default AuthContext

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) setAuthToken(token)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email, password })
      setUser(data.user)
      sessionStorage.setItem('token', data.token)
      setAuthToken(data.token)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/register', payload)
      setUser(data.user)
      sessionStorage.setItem('token', data.token)
      setAuthToken(data.token)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Register failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await api.post('/logout')
    setUser(null)
    sessionStorage.removeItem('token')
    setAuthToken(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

