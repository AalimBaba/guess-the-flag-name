export default function ScoreBadge({ score, streak }) {
  return (
    <div className="contents">
      <div className="atlas-status allow-wrap flex min-w-0 items-center justify-center rounded-sm px-2 text-center text-xs font-semibold sm:px-3 sm:text-sm">
        Score: {score}
      </div>
      <div className="atlas-success allow-wrap flex min-h-11 min-w-0 items-center justify-center rounded-sm border px-2 text-center text-xs sm:px-3 sm:text-sm">
        Streak: {streak}
      </div>
    </div>
  )
}
