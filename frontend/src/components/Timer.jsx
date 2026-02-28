export default function Timer({ seconds }) {
  return (
    <div className="px-3 py-1 rounded bg-slate-800 border border-slate-700 font-mono">
      ⏳ {String(Math.floor(seconds / 60)).padStart(2, '0')}:
      {String(seconds % 60).padStart(2, '0')}
    </div>
  )
}
