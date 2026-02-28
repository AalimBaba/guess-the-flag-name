import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')
  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])
  return (
    <button
      className="px-3 py-1 rounded hover:bg-slate-800"
      aria-label="Toggle theme"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
