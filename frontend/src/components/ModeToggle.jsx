export default function ModeToggle({
  collectionId,
  setCollectionId,
  gameMode,
  setGameMode,
  difficulty,
  setDifficulty,
  answerMode,
  setAnswerMode,
  roundLimit,
  setRoundLimit,
  collections,
}) {
  const controlClass = 'atlas-control rounded-sm px-3'
  const labelClass = 'grid min-w-0 gap-1.5'
  const labelTextClass = 'font-mono text-[11px] uppercase tracking-widest text-ink-soft dark:text-[#c2b79f]'

  return (
    <div className="grid w-full grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
      <label className={labelClass}>
        <span className={labelTextClass}>Collection</span>
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
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>Game Mode</span>
        <select
          aria-label="Game mode"
          value={gameMode}
          onChange={(event) => setGameMode(event.target.value)}
          className={controlClass}
        >
          <option value="learning">Learning</option>
          <option value="practice">Practice</option>
          <option value="timed">Timed Blitz</option>
          <option value="daily">Daily Challenge</option>
        </select>
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>Difficulty</span>
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
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>Answer Mode</span>
        <select
          aria-label="Answer mode"
          value={answerMode}
          onChange={(event) => setAnswerMode(event.target.value)}
          className={controlClass}
        >
          <option value="typing">Typing</option>
          <option value="multiple">Multiple Choice</option>
        </select>
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>Run length</span>
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
      </label>
    </div>
  )
}
