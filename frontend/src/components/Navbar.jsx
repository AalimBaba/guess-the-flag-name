import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import ThemeToggle from './ThemeToggle'
import SoundToggle from './SoundToggle'

export default function Navbar() {
  const { user, logout, ready } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  const navLink = (to, label, active) => (
    <Link
      to={to}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
        active ? 'border-brass text-ink' : 'border-transparent text-ink-soft hover:text-ink hover:border-ink/30'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-20 bg-parchment-light/90 backdrop-blur border-b border-brass/40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-baseline gap-2">
          <span className="font-display italic text-2xl text-ink">Guess the</span>
          <span className="font-display font-bold text-2xl tracking-tight text-stamp-red">
            Country Flag
          </span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
          <SoundToggle />
          {ready && user ? (
            <>
              {navLink('/dashboard', 'Play', loc.pathname === '/dashboard')}
              {navLink('/leaderboard', 'Leaderboard', loc.pathname === '/leaderboard')}
              {navLink('/profile', user.username, loc.pathname === '/profile')}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 font-mono text-xs uppercase tracking-widest border border-ink/30 rounded-full hover:bg-ink hover:text-parchment-light transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/dashboard', 'Play', loc.pathname === '/dashboard')}
              {navLink('/leaderboard', 'Leaderboard', loc.pathname === '/leaderboard')}
              {navLink('/login', 'Login', loc.pathname === '/login')}
              <Link
                to="/register"
                className="ml-2 px-3 py-1.5 font-mono text-xs uppercase tracking-widest border border-ink/30 rounded-full hover:bg-ink hover:text-parchment-light transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
