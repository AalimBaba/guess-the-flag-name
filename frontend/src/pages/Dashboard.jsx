import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getApiErrorMessage } from '../services/apiConfig'
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
  const navigate = useNavigate()
  const [mode, setMode] = useState('typing')
  const [difficulty, setDifficulty] = useState('medium')
  const [collectionId, setCollectionId] = useState('nations')
  const [roundLimit, setRoundLimit] = useState(10)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [saveError, setSaveError] = useState('')
  const nextTimeoutRef = useRef(null)
  const advanceRoundRef = useRef(null)
  const finishGameRef = useRef(null)
  const finishingRef = useRef(false)

  const {
    sessionId,
    collection,
    pool,
    current,
    score,
    streak,
    streakMax,
    answers,
    roundsPlayed,
    hasMore,
    lastResult,
    startSession,
    nextFlag,
    reset: resetEngine,
    submitAnswer,
    optionsForCurrent,
  } = useGameEngine({ collectionId, difficulty, roundLimit })

  const {
    seconds,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimer(90, () => finishGameRef.current?.('timeout'))

  const roundsLimit = useMemo(() => Math.min(roundLimit, pool.length || roundLimit), [roundLimit, pool.length])

  const clearPending = useCallback(() => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current)
      nextTimeoutRef.current = null
    }
  }, [])

  const resetGameState = useCallback(() => {
    clearPending()
    finishingRef.current = false
    setGameStarted(false)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    setSaveError('')
    stopTimer()
    resetTimer()
    resetEngine()
  }, [clearPending, resetEngine, resetTimer, stopTimer])

  const finishGame = useCallback(
    async (reason = 'complete') => {
      if (!gameStarted || finishingRef.current) return
      finishingRef.current = true
      clearPending()
      setGameStarted(false)
      setGameOver(true)
      setIsProcessing(false)
      stopTimer()

      const correctCount = answers.filter((answer) => answer.correct).length
      const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0

      if (!user || answers.length === 0) return

      try {
        await api.post('/game/save', {
          playId: sessionId,
          collectionId: collection.id,
          collectionLabel: collection.label,
          roundsPlayed: answers.length,
          correctCount,
          score,
          accuracy,
          mode,
          difficulty,
          streakMax,
          answers,
          reason,
        })
        setSaveError('')
      } catch (error) {
        setSaveError(getApiErrorMessage(error, 'Could not save this run'))
      }
    },
    [
      answers,
      clearPending,
      collection.id,
      collection.label,
      difficulty,
      gameStarted,
      mode,
      score,
      sessionId,
      stopTimer,
      streakMax,
      user,
    ]
  )

  useEffect(() => {
    finishGameRef.current = finishGame
  }, [finishGame])

  const startGame = useCallback(() => {
    clearPending()
    const first = startSession()
    if (!first) return

    finishingRef.current = false
    setSaveError('')
    setGameStarted(true)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    startTimer()
  }, [clearPending, startSession, startTimer])

  const changeCollectionId = useCallback(
    (value) => {
      if (value === collectionId) return
      resetGameState()
      setCollectionId(value)
    },
    [collectionId, resetGameState]
  )

  const changeMode = useCallback(
    (value) => {
      if (value === mode) return
      resetGameState()
      setMode(value)
    },
    [mode, resetGameState]
  )

  const changeDifficulty = useCallback(
    (value) => {
      if (value === difficulty) return
      resetGameState()
      setDifficulty(value)
    },
    [difficulty, resetGameState]
  )

  const changeRoundLimit = useCallback(
    (value) => {
      if (value === roundLimit) return
      resetGameState()
      setRoundLimit(value)
    },
    [resetGameState, roundLimit]
  )

  const advanceRound = useCallback(() => {
    setIsProcessing(false)
    setSelectedOption(null)

    if (roundsPlayed >= roundsLimit || !hasMore) {
      void finishGame('rounds')
      return
    }

    if (!nextFlag()) {
      void finishGame('pool-exhausted')
    }
  }, [finishGame, hasMore, nextFlag, roundsLimit, roundsPlayed])

  useEffect(() => {
    advanceRoundRef.current = advanceRound
  }, [advanceRound])

  const handleAnswer = useCallback(
    (guess) => {
      if (isProcessing || !gameStarted || !current) return
      setIsProcessing(true)
      if (mode === 'multiple') setSelectedOption(guess)

      const result = submitAnswer(guess)
      if (!result) {
        setIsProcessing(false)
        return
      }

      clearPending()
      nextTimeoutRef.current = setTimeout(() => advanceRoundRef.current?.(), 1100)
    },
    [clearPending, current, gameStarted, isProcessing, mode, submitAnswer]
  )

  const options = useMemo(() => {
    if (!gameStarted || !current || mode !== 'multiple') return []
    return optionsForCurrent()
  }, [current, gameStarted, mode, optionsForCurrent])

  if (ready === false) {
    return <div className="atlas-copy mx-auto max-w-4xl px-4 py-10">Restoring your session...</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ModeToggle
          collections={collectionList}
          collectionId={collectionId}
          setCollectionId={changeCollectionId}
          mode={mode}
          setMode={changeMode}
          difficulty={difficulty}
          setDifficulty={changeDifficulty}
          roundLimit={roundLimit}
          setRoundLimit={changeRoundLimit}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Timer seconds={seconds} />
          <ScoreBadge score={score} streak={streak} />
        </div>
      </div>

      {!gameStarted && !gameOver ? (
        <section className="atlas-panel space-y-6 rounded-sm p-8 md:p-10">
          <div className="space-y-3">
            <p className="atlas-kicker font-mono text-[11px] uppercase tracking-[0.3em]">{collection.label}</p>
            <h1 className="atlas-heading font-display text-4xl md:text-5xl">
              Identify the flag before the loop closes
            </h1>
            <p className="atlas-copy max-w-3xl leading-7">
              Play with national flags, U.S. states, municipal standards, or historical reconstructions.
              Guest runs stay local; sign in to save scores and climb the leaderboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startGame}
              disabled={pool.length === 0}
              className="atlas-primary rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              Start Run
            </button>
            {user ? (
              <div className="atlas-copy self-center text-sm">
                Signed in as <span className="atlas-heading">{user.username}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="atlas-secondary rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors"
              >
                Sign in to save
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {current && (
            <div className="relative">
              <FlagCard src={current.asset} alt={current.name} />
              <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white">
                {collection.label}
              </div>
              {lastResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-black/55 backdrop-blur-[2px]">
                  <div className={`mb-2 text-4xl font-black ${lastResult.correct ? 'text-green-300' : 'text-red-300'}`}>
                    {lastResult.correct ? 'Correct' : 'Wrong'}
                  </div>
                  {!lastResult.correct && <div className="mb-2 text-lg font-semibold text-white">{current.name}</div>}
                  <div className={`text-2xl font-bold ${lastResult.scoreChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {lastResult.scoreChange > 0 ? `+${lastResult.scoreChange}` : lastResult.scoreChange} pts
                  </div>
                </div>
              )}
            </div>
          )}

          {gameStarted && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="atlas-copy font-mono text-xs uppercase tracking-[0.2em]">
                  Round {Math.min(roundsPlayed + 1, roundsLimit)} of {roundsLimit}
                </div>
                <div className="atlas-copy text-sm">
                  {user ? 'Score will be saved automatically.' : 'Guest runs stay on this device only.'}
                </div>
              </div>

              {mode === 'typing' ? (
                <TypingForm
                  key={current?.id}
                  submitTyping={handleAnswer}
                  disabled={isProcessing}
                  prompt={collection.id === 'states' ? 'State, territory, or district' : 'Type the name'}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="answer-options">
                  {options.map((option) => {
                    const isCorrect = option.id === current?.id
                    const isSelected = option.name === selectedOption
                    let buttonClass = 'atlas-answer'

                    if (isProcessing) {
                      if (isCorrect) buttonClass = 'atlas-answer-correct'
                      else if (isSelected) buttonClass = 'atlas-answer-wrong'
                      else buttonClass = 'atlas-answer-muted'
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAnswer(option.name)}
                        className={`${buttonClass} rounded-sm border px-4 py-4 text-left font-medium transition-all`}
                      >
                        {option.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {saveError && <div className="atlas-error rounded-sm px-4 py-3 text-sm">{saveError}</div>}

      {gameOver && (
        <div className="atlas-panel space-y-5 rounded-sm p-6 md:p-8">
          <h2 className="atlas-heading font-display text-3xl">Run complete</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Final Score" value={score} />
            <Stat
              label="Accuracy"
              value={
                answers.length
                  ? `${Math.round((answers.filter((answer) => answer.correct).length / answers.length) * 100)}%`
                  : '0%'
              }
            />
            <Stat label="Best Streak" value={streakMax} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="atlas-primary rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em]"
              onClick={startGame}
            >
              Play Again
            </button>
            <button
              type="button"
              className="atlas-secondary rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${score} on Guess the Flag Name!`)}`
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

  const handleSubmit = (event) => {
    event.preventDefault()
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
          aria-label="Flag answer"
          placeholder={prompt}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="atlas-control flex-1 rounded-sm px-4 py-3 text-lg disabled:opacity-50"
        />
        <button
          disabled={disabled}
          className="atlas-primary rounded-sm px-6 py-3 font-bold transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  )
}

function Stat({ label, value }) {
  return (
    <div className="atlas-status rounded-sm px-4 py-3">
      <div className="atlas-copy text-xs uppercase tracking-[0.2em]">{label}</div>
      <div className="atlas-heading text-2xl font-bold">{value}</div>
    </div>
  )
}
