import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/useAuth.js'
import { collectionList } from '../data/collections'
import { useTimer } from '../hooks/useTimer'
import { useGameEngine } from '../hooks/useGameEngine'
import FlagCard from '../components/FlagCard'
import Timer from '../components/Timer'
import ScoreBadge from '../components/ScoreBadge'
import ModeToggle from '../components/ModeToggle'

export default function Dashboard() {
  const { user, ready } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('typing')
  const [difficulty, setDifficulty] = useState('medium')
  const [collectionId, setCollectionId] = useState('nations')
  const [roundLimit, setRoundLimit] = useState(10)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [saveError, setSaveError] = useState('')
  const engine = useGameEngine({ collectionId, difficulty, mode, roundLimit })
  const timer = useTimer(90)
  const nextTimeoutRef = useRef(null)

  const roundsLimit = useMemo(() => Math.min(roundLimit, engine.pool.length || roundLimit), [roundLimit, engine.pool.length])

  const clearPending = useCallback(() => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current)
      nextTimeoutRef.current = null
    }
  }, [])

  const resetGameState = useCallback(() => {
    clearPending()
    setGameStarted(false)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    timer.stop()
    engine.reset()
  }, [clearPending, engine, timer])

  const finishGame = useCallback(
    async (reason = 'complete') => {
      if (!gameStarted && !gameOver) return
      clearPending()
      setGameStarted(false)
      setGameOver(true)
      setIsProcessing(false)
      timer.stop()

      const correctCount = engine.answers.filter((answer) => answer.correct).length
      const accuracy = engine.answers.length
        ? Math.round((correctCount / engine.answers.length) * 100)
        : 0

      if (!user) return

      try {
        await api.post('/game/save', {
          playId: engine.sessionId,
          collectionId: engine.collection.id,
          collectionLabel: engine.collection.label,
          roundsPlayed: engine.answers.length,
          correctCount,
          score: engine.score,
          accuracy,
          mode,
          difficulty,
          streakMax: engine.streakMax,
          answers: engine.answers,
          reason,
        })
        setSaveError('')
      } catch (err) {
        setSaveError(err.response?.data?.message || 'Could not save this run')
      }
    },
    [
      clearPending,
      difficulty,
      engine.answers,
      engine.collection.id,
      engine.collection.label,
      engine.score,
      engine.sessionId,
      engine.streakMax,
      gameOver,
      gameStarted,
      mode,
      timer,
      user,
    ]
  )

  const startGame = useCallback(() => {
    clearPending()
    setSaveError('')
    engine.reset()
    engine.nextFlag()
    setGameStarted(true)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    timer.start()
  }, [clearPending, engine, timer])

  useEffect(() => {
    const resetId = setTimeout(() => resetGameState(), 0)
    return () => clearTimeout(resetId)
  }, [collectionId, difficulty, mode, roundLimit, resetGameState])

  useEffect(() => {
    if (gameStarted && timer.seconds === 0) {
      const timeoutId = setTimeout(() => finishGame('timeout'), 0)
      return () => clearTimeout(timeoutId)
    }
  }, [finishGame, gameStarted, timer.seconds])

  const advanceRound = useCallback(() => {
    setIsProcessing(false)
    setSelectedOption(null)
    if (engine.roundsPlayed >= roundsLimit || !engine.hasMore) {
      finishGame('rounds')
      return
    }
    const next = engine.nextFlag()
    if (!next) {
      finishGame('pool-exhausted')
    }
  }, [engine, finishGame, roundsLimit])

  const handleAnswer = useCallback(
    (guess) => {
      if (isProcessing || !gameStarted || !engine.current) return
      setIsProcessing(true)
      if (mode === 'multiple') setSelectedOption(guess)
      engine.submitAnswer(guess)
      clearPending()
      nextTimeoutRef.current = setTimeout(advanceRound, 1100)
    },
    [advanceRound, clearPending, engine, gameStarted, isProcessing, mode]
  )

  const options = useMemo(() => {
    if (!gameStarted || !engine.current || mode !== 'multiple') return []
    return engine.optionsForCurrent()
  }, [engine, gameStarted, mode])

  if (ready === false) {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-ink-soft">Restoring your session...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ModeToggle
          collections={collectionList}
          collectionId={collectionId}
          setCollectionId={setCollectionId}
          mode={mode}
          setMode={setMode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          roundLimit={roundLimit}
          setRoundLimit={setRoundLimit}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Timer seconds={timer.seconds} />
          <ScoreBadge score={engine.score} streak={engine.streak} />
        </div>
      </div>

      {!gameStarted && !gameOver ? (
        <section className="bg-parchment-light border border-brass/30 rounded-sm p-8 md:p-10 shadow-paper space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-faint">
              {engine.collection.label}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-ink">Identify the flag before the loop closes</h1>
            <p className="max-w-3xl text-ink-soft leading-7">
              Play with national flags, U.S. states, municipal standards, or historical reconstructions.
              Guest runs stay local; sign in to save scores and climb the leaderboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={startGame}
              disabled={engine.pool.length === 0}
              className="rounded-full bg-ink text-parchment-light px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-ink/90 disabled:opacity-50"
            >
              Start Run
            </button>
            {user ? (
              <div className="self-center text-sm text-ink-soft">
                Signed in as <span className="text-ink">{user.username}</span>
              </div>
            ) : (
              <button
                onClick={() => nav('/login')}
                className="rounded-full border border-ink/20 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-parchment-light transition-colors"
              >
                Sign in to save
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {engine.current && (
            <div className="relative">
              <FlagCard src={engine.current.asset} alt={engine.current.name} />
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white">
                {engine.collection.label}
              </div>
              {engine.lastResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
                  <div
                    className={`text-4xl font-black mb-2 ${
                      engine.lastResult.correct ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {engine.lastResult.correct ? 'Correct' : 'Wrong'}
                  </div>
                  {!engine.lastResult.correct && (
                    <div className="text-lg font-semibold text-white mb-2">{engine.current.name}</div>
                  )}
                  <div
                    className={`text-2xl font-bold ${
                      engine.lastResult.scoreChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {engine.lastResult.scoreChange > 0
                      ? `+${engine.lastResult.scoreChange}`
                      : engine.lastResult.scoreChange}{' '}
                    pts
                  </div>
                </div>
              )}
            </div>
          )}

          {gameStarted && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
                  Round {Math.min(engine.roundsPlayed + 1, roundsLimit)} of {roundsLimit}
                </div>
                <div className="text-sm text-ink-soft">
                  {user ? 'Score will be saved automatically.' : 'Guest runs stay on this device only.'}
                </div>
              </div>

              {mode === 'typing' ? (
                <TypingForm
                  key={engine.current?.id}
                  submitTyping={handleAnswer}
                  disabled={isProcessing}
                  prompt={engine.collection.id === 'states' ? 'State, territory, or district' : 'Type the name'}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt) => {
                    const isCorrect = opt.id === engine.current?.id
                    const isSelected = opt.id === selectedOption
                    let btnClass = 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    if (isProcessing) {
                      if (isCorrect) btnClass = 'bg-green-600/40 border-green-500 text-green-100'
                      else if (isSelected) btnClass = 'bg-red-600/40 border-red-500 text-red-100'
                      else btnClass = 'bg-slate-800/40 border-slate-800 opacity-50'
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isProcessing}
                        onClick={() => handleAnswer(opt.name)}
                        className={`rounded-lg border px-4 py-4 text-left transition-all font-medium ${btnClass}`}
                      >
                        {opt.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {saveError && (
        <div className="rounded-sm border border-stamp-red/40 bg-stamp-red/5 px-4 py-3 text-stamp-red text-sm">
          {saveError}
        </div>
      )}

      {gameOver && (
        <div className="rounded-sm border border-brass/30 bg-parchment-light p-6 md:p-8 shadow-paper space-y-5">
          <h2 className="font-display text-3xl text-ink">Run complete</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Final Score" value={engine.score} />
            <Stat
              label="Accuracy"
              value={
                engine.answers.length
                  ? `${Math.round(
                      (engine.answers.filter((answer) => answer.correct).length / engine.answers.length) * 100
                    )}%`
                  : '0%'
              }
            />
            <Stat label="Best Streak" value={engine.streakMax} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-ink text-parchment-light px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-ink/90"
              onClick={startGame}
            >
              Play Again
            </button>
            <button
              className="rounded-full border border-ink/20 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-parchment-light transition-colors"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I scored ${engine.score} on Guess the Flag Name!`
                  )}`
                )
              }
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TypingForm({ submitTyping, disabled, prompt }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim() || disabled) return
    submitTyping(query)
    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          autoFocus
          disabled={disabled}
          name="answer"
          placeholder={prompt}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-lg disabled:opacity-50"
        />
        <button
          disabled={disabled}
          className="rounded-lg bg-brand-600 hover:bg-brand-500 px-6 py-3 font-bold disabled:opacity-50 transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-sm bg-white border border-ink/10 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </div>
  )
}
