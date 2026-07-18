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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="atlas-heading text-2xl font-bold">Leaderboard</h2>
        <select
          aria-label="Leaderboard period"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="atlas-control h-9 rounded-sm px-3 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="all">All-time</option>
        </select>
      </div>

      {error && <div className="atlas-error mb-4 rounded-sm px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <div className="atlas-copy">Loading...</div>
      ) : (
        <div className="atlas-panel overflow-hidden rounded-sm">
          <table className="w-full">
            <thead className="bg-parchment-dark/50 dark:bg-[#1b2538]">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">Score</th>
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
                  <td className="px-4 py-3">{row.username}</td>
                  <td className="px-4 py-3">{row.score}</td>
                </tr>
              ))}
              {!error && rows.length === 0 && (
                <tr>
                  <td className="atlas-copy px-4 py-8 text-center" colSpan="3">
                    No recorded runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
