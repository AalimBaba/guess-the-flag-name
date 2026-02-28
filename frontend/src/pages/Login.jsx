import { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(form.email, form.password)
    setLoading(false)
    if (!res.ok) {
      setError(res.message)
    } else {
      nav('/dashboard')
    }
  }
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900/60 border border-slate-700 p-6 shadow-2xl backdrop-blur transition-all duration-300">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          <div className="relative">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-2.5 text-slate-400"
              aria-label="Toggle password visibility"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 hover:bg-brand-500 transition-colors px-4 py-2 font-semibold"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4 text-center">
          New here?{' '}
          <Link className="text-brand-400 hover:text-brand-300" to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
