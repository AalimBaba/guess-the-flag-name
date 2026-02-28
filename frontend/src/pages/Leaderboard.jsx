import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/useAuth.js'

export default function Leaderboard() {
  const [scope, setScope] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  useEffect(() => {
    api
      .get('/leaderboard', { params: { scope } })
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false))
  }, [scope])
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <select value={scope} onChange={(e) => setScope(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-1">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="all">All-time</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Player</th>
                <th className="text-left px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.userId} className={`border-t border-slate-800 ${user && user.id === r.userId ? 'bg-brand-900/20' : ''}`}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{r.username}</td>
                  <td className="px-4 py-2">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
