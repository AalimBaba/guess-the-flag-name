export default function ScoreBadge({ score, streak }) {
  return (
    <div className="flex items-center gap-3">
      <div className="atlas-status flex h-9 items-center rounded-sm px-3 font-semibold">Score: {score}</div>
      <div className="atlas-success flex h-9 items-center rounded-sm border px-3">Streak: {streak}</div>
    </div>
  )
}
