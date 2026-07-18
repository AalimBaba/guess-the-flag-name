export default function ModeToggle({
  collectionId,
  setCollectionId,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  roundLimit,
  setRoundLimit,
  collections,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={collectionId}
        onChange={(e) => setCollectionId(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-1"
      >
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.label}
          </option>
        ))}
      </select>
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
      <select
        value={roundLimit}
        onChange={(e) => setRoundLimit(Number(e.target.value))}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-1"
      >
        <option value={10}>10 rounds</option>
        <option value={15}>15 rounds</option>
        <option value={20}>20 rounds</option>
      </select>
    </div>
  )
}
