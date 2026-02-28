export default function ModeToggle({ mode, setMode, difficulty, setDifficulty }) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-1"
      >
        <option value="typing">Typing</option>
        <option value="multiple">Multiple Choice</option>
      </select>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-1"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  )
}
