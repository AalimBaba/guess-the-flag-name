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
        active
          ? 'border-brass text-ink dark:text-[#f1e7cf]'
          : 'border-transparent text-ink-soft hover:text-ink hover:border-ink/30 dark:text-[#c2b79f] dark:hover:text-[#f1e7cf] dark:hover:border-[#b39451]/60'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-20 border-b border-brass/40 bg-parchment-light/90 backdrop-blur dark:border-[#b39451]/50 dark:bg-[#101624]/95">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-baseline gap-2">
          <span className="font-display italic text-2xl text-ink dark:text-[#f1e7cf]">Guess the</span>
          <span className="font-display font-bold text-2xl tracking-tight text-stamp-red dark:text-[#d77f76]">
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
                className="atlas-secondary ml-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors"
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
                className="atlas-secondary ml-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors"
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
