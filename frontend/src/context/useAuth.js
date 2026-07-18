import { useContext } from 'react'
import AuthContext from './AuthContext.jsx'
export const useAuth = () =>
  useContext(AuthContext) || {
    user: null,
    loading: false,
    ready: true,
    login: async () => ({ ok: false }),
    register: async () => ({ ok: false }),
    logout: async () => {},
    refreshUser: async () => null,
  }
