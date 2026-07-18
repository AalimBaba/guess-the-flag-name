import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import ThemeToggle from './ThemeToggle'
import SoundToggle from './SoundToggle'

export default function Navbar() {
  const { user, logout, ready } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuPath, setMenuPath] = useState(null)
  const menuOpen = menuPath === location.pathname

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuPath(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLogout = async () => {
    setMenuPath(null)
    await logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuPath(null)

  const navLink = (to, label, mobile = false) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        onClick={closeMenu}
        aria-current={active ? 'page' : undefined}
        className={
          mobile
            ? `allow-wrap flex min-h-11 w-full items-center border-l-2 px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                active
                  ? 'border-brass bg-brass/10 text-ink dark:text-[#f1e7cf]'
                  : 'border-transparent text-ink-soft dark:text-[#c2b79f]'
              }`
            : `flex min-h-11 items-center border-b-2 px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                active
                  ? 'border-brass text-ink dark:text-[#f1e7cf]'
                  : 'border-transparent text-ink-soft hover:text-ink hover:border-ink/30 dark:text-[#c2b79f] dark:hover:text-[#f1e7cf] dark:hover:border-[#b39451]/60'
              }`
        }
      >
        {label}
      </Link>
    )
  }

  const accountLinks = (mobile = false) =>
    ready && user ? (
      <>
        {navLink('/dashboard', 'Play', mobile)}
        {navLink('/leaderboard', 'Leaderboard', mobile)}
        {navLink('/profile', user.username, mobile)}
        <button
          type="button"
          onClick={handleLogout}
          className={
            mobile
              ? 'atlas-secondary allow-wrap mt-2 w-full rounded-sm px-4 py-2.5 font-mono text-xs uppercase tracking-widest'
              : 'atlas-secondary ml-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors'
          }
        >
          Logout
        </button>
      </>
    ) : (
      <>
        {navLink('/dashboard', 'Play', mobile)}
        {navLink('/leaderboard', 'Leaderboard', mobile)}
        {navLink('/login', 'Login', mobile)}
        <Link
          to="/register"
          onClick={closeMenu}
          className={
            mobile
              ? 'atlas-primary mt-2 w-full rounded-sm px-4 py-2.5 font-mono text-xs uppercase tracking-widest'
              : 'atlas-secondary ml-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors'
          }
        >
          Register
        </Link>
      </>
    )

  return (
    <header className="site-header sticky top-0 z-30 border-b border-brass/40 bg-parchment-light/95 backdrop-blur dark:border-[#b39451]/50 dark:bg-[#101624]/95">
      <div className="site-header-row mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-1 py-2">
        <Link
          to={user ? '/dashboard' : '/'}
          onClick={closeMenu}
          className="allow-wrap flex min-h-11 min-w-0 shrink flex-col justify-center leading-none sm:flex-row sm:items-center sm:gap-2"
          aria-label="Guess the Country Flag home"
        >
          <span className="font-display text-sm italic text-ink dark:text-[#f1e7cf] sm:text-2xl">Guess the</span>
          <span className="font-display text-lg font-bold text-stamp-red dark:text-[#d77f76] sm:text-2xl">
            Country Flag
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Primary navigation">
          <ThemeToggle />
          <SoundToggle />
          {accountLinks()}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
          <ThemeToggle />
          <SoundToggle />
          <button
            type="button"
            className="atlas-icon-button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuPath(menuOpen ? null : location.pathname)}
          >
            {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-brass/40 bg-parchment-light/98 shadow-xl dark:border-[#b39451]/50 dark:bg-[#101624] lg:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mobile-menu-inner mx-auto max-w-6xl overflow-y-auto py-3"
          >
            <div className="grid gap-1">{accountLinks(true)}</div>
          </nav>
        </div>
      )}
    </header>
  )
}
