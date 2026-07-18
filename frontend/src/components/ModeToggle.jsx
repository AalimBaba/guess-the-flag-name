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
  const controlClass = 'atlas-control h-9 rounded-sm px-3 text-sm'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Flag collection"
        value={collectionId}
        onChange={(event) => setCollectionId(event.target.value)}
        className={controlClass}
      >
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Answer mode"
        value={mode}
        onChange={(event) => setMode(event.target.value)}
        className={controlClass}
      >
        <option value="typing">Typing</option>
        <option value="multiple">Multiple Choice</option>
      </select>
      <select
        aria-label="Difficulty"
        value={difficulty}
        onChange={(event) => setDifficulty(event.target.value)}
        className={controlClass}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <select
        aria-label="Round limit"
        value={roundLimit}
        onChange={(event) => setRoundLimit(Number(event.target.value))}
        className={controlClass}
      >
        <option value={10}>10 rounds</option>
        <option value={15}>15 rounds</option>
        <option value={20}>20 rounds</option>
      </select>
    </div>
  )
}
