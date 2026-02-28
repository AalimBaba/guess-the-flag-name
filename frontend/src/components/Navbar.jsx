import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import ThemeToggle from './ThemeToggle'
import SoundToggle from './SoundToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-slate-900/70 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="font-bold text-xl">
          Guess the Country Flag
        </Link>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <SoundToggle />
          {user ? (
            <>
              <Link
                to="/leaderboard"
                className={`px-3 py-1 rounded ${loc.pathname === '/leaderboard' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
              >
                Leaderboard
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-1 rounded ${loc.pathname === '/profile' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
              >
                {user.username}
              </Link>
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 rounded hover:bg-slate-800">
                Login
              </Link>
              <Link to="/register" className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
