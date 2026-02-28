export default function ScoreBadge({ score, streak }) {
  return (
    <div className="flex items-center gap-3">
      <div className="px-3 py-1 rounded bg-brand-700 font-semibold">Score: {score}</div>
      <div className="px-3 py-1 rounded bg-green-700">Streak: {streak}</div>
    </div>
  )
}
