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
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <CompassWatermark />
      <div className="relative z-10 w-full max-w-md">
        <div className="relative z-10 mb-[-1.1rem] flex justify-center">
          <span className="visa-stamp text-sm">Entry Visa Application</span>
        </div>
        <div className="atlas-frame atlas-panel rounded-sm p-8 pt-10">
          <p className="atlas-kicker mb-1 text-center font-mono text-[11px] uppercase tracking-[0.3em]">
            New Traveler Registration
          </p>
          <h2 className="atlas-heading mb-6 text-center font-display text-3xl">Create Account</h2>

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
            <Field label="Username">
              <input name="username" value={form.username} onChange={onChange} className="field-underline" required />
            </Field>
            <Field label="Email">
              <input name="email" type="email" value={form.email} onChange={onChange} className="field-underline" required />
            </Field>
            <div className="relative">
              <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                className="field-underline pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="atlas-kicker absolute bottom-2 right-1 font-mono text-[10px] uppercase tracking-widest hover:text-[color:var(--atlas-ink)]"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <Field label="Confirm Password">
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                className="field-underline"
                required
              />
            </Field>

            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="atlas-kicker font-mono text-[10px] uppercase tracking-widest">Document Strength</span>
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
              disabled={loading}
              className="atlas-primary mt-2 w-full rounded-full px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Submit Application'}
            </button>
          </form>

          <p className="atlas-copy mt-6 text-center text-sm">
            Already hold a passport?{' '}
            <Link className="atlas-accent hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="atlas-kicker font-mono text-[11px] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}
