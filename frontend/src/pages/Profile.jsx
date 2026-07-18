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

  if (loading) {
    return (
      <div className="page-shell atlas-copy max-w-4xl py-8" role="status">
        Loading profile...
      </div>
    )
  }
  if (error) {
    return (
      <div className="page-shell max-w-4xl py-6">
        <div className="atlas-error allow-wrap rounded-sm px-4 py-3" role="alert">
          {error}
        </div>
      </div>
    )
  }
  if (!data) return null

  return (
    <main className="page-shell max-w-4xl space-y-6 py-5 sm:py-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="atlas-status flex h-14 w-14 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16">
          <UserRound size={30} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="atlas-heading allow-wrap text-2xl font-bold sm:text-3xl">{data.username}</h1>
          <p className="atlas-copy break-all text-sm sm:text-base">{data.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <Stat label="Total games" value={data.stats.totalGames} />
        <Stat label="Best score" value={data.stats.bestScore} />
        <Stat label="Avg accuracy" value={`${data.stats.avgAccuracy}%`} />
      </div>

      <div>
        <h2 className="atlas-heading mb-2 text-lg font-semibold">Recent games</h2>
        <div className="space-y-2">
          {data.recentGames.map((game) => (
            <div
              key={game._id}
              className="atlas-panel flex min-w-0 flex-col justify-between gap-1 rounded-sm px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="allow-wrap capitalize">
                {game.mode} | {game.difficulty}
              </span>
              <span className="atlas-copy allow-wrap text-sm sm:text-right">
                Score {game.score} | {new Date(game.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {data.recentGames.length === 0 && <p className="atlas-copy">No saved runs yet.</p>}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div className="atlas-status min-w-0 rounded-sm px-4 py-3">
      <div className="atlas-copy text-sm">{label}</div>
      <div className="atlas-heading allow-wrap text-xl font-bold">{value}</div>
    </div>
  )
}
