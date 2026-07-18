import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { ACCOUNTS_UNAVAILABLE_MESSAGE } from '../services/apiConfig'
import CompassWatermark from '../components/CompassWatermark'

export default function Login() {
  const { login, apiAvailable } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (!result.ok) setError(result.message)
    else navigate('/dashboard')
  }

  const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  return (
    <main className="auth-shell relative flex items-start justify-center sm:items-center">
      <CompassWatermark />
      <div className="relative z-10 min-w-0 w-full max-w-md">
        <div className="relative z-10 mb-[-1.1rem] flex justify-center">
          <span className="visa-stamp max-w-[calc(100%_-_1.5rem)] text-center text-xs sm:text-sm">Re-Entry Permit</span>
        </div>
        <div className="atlas-frame atlas-panel rounded-sm p-5 pt-10 sm:p-8 sm:pt-10">
          <p className="atlas-kicker allow-wrap mb-1 text-center font-mono text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.3em]">
            Traveler Identification
          </p>
          <h1 className="atlas-heading mb-6 text-center font-display text-2xl sm:text-3xl">Welcome Back</h1>

          {!apiAvailable && error !== ACCOUNTS_UNAVAILABLE_MESSAGE && (
            <div className="atlas-error mb-4 rounded-sm px-3 py-2 text-sm" role="status">
              {ACCOUNTS_UNAVAILABLE_MESSAGE}
            </div>
          )}
          {error && (
            <div className="atlas-error mb-4 rounded-sm px-3 py-2 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={onChange}
                className="field-underline"
                required
              />
            </div>
            <div className="relative">
              <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={onChange}
                className="field-underline pr-16"
                required
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="atlas-kicker touch-target absolute bottom-0 right-0 flex items-center justify-center px-2 font-mono text-[10px] uppercase tracking-widest hover:text-[color:var(--atlas-ink)]"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="atlas-primary mt-2 w-full rounded-full px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Stamp Passport & Enter'}
            </button>
          </form>

          <p className="atlas-copy allow-wrap mt-6 text-center text-sm">
            New traveler?{' '}
            <Link className="atlas-accent inline-flex min-h-11 items-center px-1 hover:underline" to="/register">
              Apply for a passport
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
