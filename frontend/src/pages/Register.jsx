import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { ACCOUNTS_UNAVAILABLE_MESSAGE } from '../services/apiConfig'
import CompassWatermark from '../components/CompassWatermark'

export default function Register() {
  const { register, apiAvailable } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = (() => {
    const password = form.password
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  })()

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || 'Too short'
  const strengthColor =
    strength < 2 ? 'atlas-accent' : strength < 3 ? 'text-[color:var(--atlas-border)]' : 'text-[color:var(--atlas-success)]'

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(form)
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
          <span className="visa-stamp max-w-[calc(100%_-_1.5rem)] text-center text-xs sm:text-sm">
            Entry Visa Application
          </span>
        </div>
        <div className="atlas-frame atlas-panel rounded-sm p-5 pt-10 sm:p-8 sm:pt-10">
          <p className="atlas-kicker allow-wrap mb-1 text-center font-mono text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.3em]">
            New Traveler Registration
          </p>
          <h1 className="atlas-heading mb-6 text-center font-display text-2xl sm:text-3xl">Create Account</h1>

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
            <Field id="register-username" label="Username">
              <input
                id="register-username"
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={onChange}
                className="field-underline"
                required
              />
            </Field>
            <Field id="register-email" label="Email">
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={onChange}
                className="field-underline"
                required
              />
            </Field>
            <div className="relative">
              <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
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
            <Field id="register-confirm-password" label="Confirm Password">
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={onChange}
                className="field-underline"
                required
              />
            </Field>

            <div>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <span className="atlas-kicker allow-wrap font-mono text-[10px] uppercase tracking-widest">Document Strength</span>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${strengthColor}`}>
                  {form.password ? strengthLabel : '-'}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'][strength - 1] || 'w-0'
                  } ${
                    strength < 2 ? 'bg-stamp-red dark:bg-[#e08a82]' : strength < 3 ? 'bg-brass' : 'bg-stamp-green dark:bg-[#8fc79a]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="atlas-primary mt-2 w-full rounded-full px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Submit Application'}
            </button>
          </form>

          <p className="atlas-copy allow-wrap mt-6 text-center text-sm">
            Already hold a passport?{' '}
            <Link className="atlas-accent inline-flex min-h-11 items-center px-1 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({ id, label, children }) {
  return (
    <div>
      <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}
