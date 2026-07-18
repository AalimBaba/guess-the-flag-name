import { Clock3 } from 'lucide-react'

export default function Timer({ seconds }) {
  return (
    <div
      className="atlas-status flex min-w-0 items-center justify-center gap-1 rounded-sm px-2 font-mono text-xs sm:gap-2 sm:px-3 sm:text-sm"
      aria-label={`${seconds} seconds remaining`}
    >
      <Clock3 className="shrink-0" size={16} aria-hidden="true" />
      <span className="whitespace-nowrap" data-testid="timer-value">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
      </span>
    </div>
  )
}
