import { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { Link, useNavigate } from 'react-router-dom'
import CompassWatermark from '../components/CompassWatermark'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
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
    const s = form.password
    let score = 0
    if (s.length >= 8) score++
    if (/[A-Z]/.test(s)) score++
    if (/[0-9]/.test(s)) score++
    if (/[^A-Za-z0-9]/.test(s)) score++
    return score
  })()

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] || 'Too short'
  const strengthColor =
    strength < 2 ? 'text-stamp-red' : strength < 3 ? 'text-brass-dark' : 'text-stamp-green'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await register(form)
    setLoading(false)
    if (!res.ok) {
      setError(res.message)
    } else {
      nav('/dashboard')
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
      <CompassWatermark />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-[-1.1rem] relative z-10">
          <span className="visa-stamp text-sm">Entry Visa Application</span>
        </div>
        <div className="atlas-frame bg-parchment-light rounded-sm p-8 pt-10">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-faint text-center mb-1">
            New Traveler Registration
          </p>
          <h2 className="font-display text-3xl text-center text-ink mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 border border-stamp-red/40 bg-stamp-red/5 text-stamp-red text-sm px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                className="field-underline"
                required
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                className="field-underline"
                required
              />
            </div>
            <div className="relative">
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                Password
              </label>
              <input
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                className="field-underline pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-1 bottom-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint hover:text-ink"
                aria-label="Toggle password visibility"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                className="field-underline"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Document Strength
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${strengthColor}`}>
                  {form.password ? strengthLabel : '—'}
                </span>
              </div>
              <div className="h-1 w-full bg-ink/10 rounded-full overflow-hidden">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'][strength - 1] || 'w-0'
                  } ${strength < 2 ? 'bg-stamp-red' : strength < 3 ? 'bg-brass' : 'bg-stamp-green'}`}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full mt-2 rounded-full bg-ink text-parchment-light hover:bg-ink/90 transition-colors px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Submit Application'}
            </button>
          </form>

          <p className="text-sm text-ink-soft mt-6 text-center font-body">
            Already hold a passport?{' '}
            <Link className="text-stamp-red hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
