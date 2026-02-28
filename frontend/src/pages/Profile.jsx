import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api
      .get('/profile')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])
  if (loading) return <div className="p-6">Loading...</div>
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-700" />
        <div>
          <h2 className="text-2xl font-bold">{data.username}</h2>
          <p className="text-slate-400">{data.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total games" value={data.stats.totalGames} />
        <Stat label="Best score" value={data.stats.bestScore} />
        <Stat label="Avg accuracy" value={`${data.stats.avgAccuracy}%`} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Recent games</h3>
        <div className="space-y-2">
          {data.recentGames.map((g) => (
            <div key={g._id} className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 flex justify-between">
              <span>
                {g.mode} · {g.difficulty}
              </span>
              <span>
                Score {g.score} · {new Date(g.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-3">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
