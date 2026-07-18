import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { getApiErrorMessage } from '../services/apiConfig'
import { useAuth } from '../context/useAuth.js'

export default function Leaderboard() {
  const [scope, setScope] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/leaderboard', { params: { scope } })
      setRows(data)
      setError('')
    } catch (requestError) {
      setRows([])
      setError(getApiErrorMessage(requestError, 'Could not load the leaderboard'))
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    void loadLeaderboard()
  }, [loadLeaderboard])

  return (
    <main className="page-shell max-w-3xl py-5 sm:py-8">
      <div className="mb-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
        <h1 className="atlas-heading text-2xl font-bold sm:text-3xl">Leaderboard</h1>
        <label className="grid gap-1 min-[480px]:w-44">
          <span className="atlas-kicker font-mono text-[11px] uppercase tracking-widest">Period</span>
          <select
            aria-label="Leaderboard period"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="atlas-control rounded-sm px-3"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="all">All-time</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="atlas-error allow-wrap mb-4 rounded-sm px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="atlas-copy py-4" role="status">
          Loading leaderboard...
        </div>
      ) : !error ? (
        <>
          <div className="space-y-2 sm:hidden" aria-label="Leaderboard entries">
            {rows.map((row, index) => (
              <article
                key={row.userId}
                className={`atlas-panel grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-sm p-4 ${
                  user && user.id === row.userId ? 'bg-brass/10 dark:bg-[#b39451]/15' : ''
                }`}
              >
                <div className="atlas-kicker row-span-2 flex h-11 min-w-11 items-center justify-center rounded-full border border-brass/40 font-mono text-sm">
                  #{index + 1}
                </div>
                <div className="allow-wrap font-semibold">{row.username}</div>
                <div className="atlas-copy text-sm">
                  <span className="sr-only">Score </span>
                  {row.score} points
                </div>
              </article>
            ))}
            {rows.length === 0 && <EmptyLeaderboard />}
          </div>

          <div className="atlas-panel hidden overflow-x-auto rounded-sm sm:block">
            <table className="w-full min-w-[420px]">
              <thead className="bg-parchment-dark/50 dark:bg-[#1b2538]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">#</th>
                  <th scope="col" className="px-4 py-3 text-left">Player</th>
                  <th scope="col" className="px-4 py-3 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.userId}
                    className={`border-t border-brass/20 dark:border-[#b39451]/25 ${
                      user && user.id === row.userId ? 'bg-brass/10 dark:bg-[#b39451]/15' : ''
                    }`}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="allow-wrap px-4 py-3">{row.username}</td>
                    <td className="px-4 py-3">{row.score}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="atlas-copy px-4 py-8 text-center" colSpan="3">
                      No recorded runs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </main>
  )
}

function EmptyLeaderboard() {
  return <div className="atlas-panel atlas-copy rounded-sm px-4 py-8 text-center">No recorded runs yet.</div>
}
