import { useCallback, useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { api } from '../services/api'
import { getApiErrorMessage } from '../services/apiConfig'

export default function Profile() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data: profile } = await api.get('/profile')
      setData(profile)
      setError('')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load profile'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  if (loading) return <div className="atlas-copy p-6">Loading...</div>
  if (error) return <div className="atlas-error m-6 rounded-sm px-4 py-3">{error}</div>
  if (!data) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="atlas-status flex h-16 w-16 items-center justify-center rounded-full">
          <UserRound size={30} aria-hidden="true" />
        </div>
        <div>
          <h2 className="atlas-heading text-2xl font-bold">{data.username}</h2>
          <p className="atlas-copy">{data.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Total games" value={data.stats.totalGames} />
        <Stat label="Best score" value={data.stats.bestScore} />
        <Stat label="Avg accuracy" value={`${data.stats.avgAccuracy}%`} />
      </div>

      <div>
        <h3 className="atlas-heading mb-2 font-semibold">Recent games</h3>
        <div className="space-y-2">
          {data.recentGames.map((game) => (
            <div
              key={game._id}
              className="atlas-panel flex flex-col justify-between gap-1 rounded-sm px-4 py-3 sm:flex-row"
            >
              <span className="capitalize">
                {game.mode} | {game.difficulty}
              </span>
              <span className="atlas-copy">
                Score {game.score} | {new Date(game.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {data.recentGames.length === 0 && <p className="atlas-copy">No saved runs yet.</p>}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="atlas-status rounded-sm px-4 py-3">
      <div className="atlas-copy text-sm">{label}</div>
      <div className="atlas-heading text-xl font-bold">{value}</div>
    </div>
  )
}
