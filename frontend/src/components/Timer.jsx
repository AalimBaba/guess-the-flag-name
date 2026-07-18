import { Clock3 } from 'lucide-react'

export default function Timer({ seconds }) {
  return (
    <div
      className="atlas-status flex h-9 items-center gap-2 rounded-sm px-3 font-mono text-sm"
      aria-label={`${seconds} seconds remaining`}
    >
      <Clock3 size={16} aria-hidden="true" />
      <span data-testid="timer-value">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
      </span>
    </div>
  )
}
