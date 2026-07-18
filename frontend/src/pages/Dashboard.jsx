import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { apiStatus, getApiErrorMessage } from '../services/apiConfig'
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

      if (!apiStatus.configured || !user || answers.length === 0) return

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
    return (
      <div className="page-shell atlas-copy max-w-4xl py-10" role="status">
        Restoring your session...
      </div>
    )
  }

  return (
    <main className="page-shell max-w-5xl space-y-4 py-4 sm:space-y-6 sm:py-8">
      <div className="flex flex-col gap-4">
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
        <div className="grid w-full grid-cols-3 gap-2 sm:ml-auto sm:w-auto sm:min-w-[360px]">
          <Timer seconds={seconds} />
          <ScoreBadge score={score} streak={streak} />
        </div>
      </div>

      {!gameStarted && !gameOver ? (
        <section className="atlas-panel space-y-6 rounded-sm p-5 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <p className="atlas-kicker allow-wrap font-mono text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              {collection.label}
            </p>
            <h1 className="atlas-heading allow-wrap font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Identify the flag before the loop closes
            </h1>
            <p className="atlas-copy max-w-3xl text-sm leading-6 sm:text-base sm:leading-7">
              Play with national flags, U.S. states, municipal standards, or historical reconstructions.
              Guest runs stay local; sign in to save scores and climb the leaderboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center">
            <button
              type="button"
              onClick={startGame}
              disabled={pool.length === 0}
              className="atlas-primary w-full rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-50 min-[480px]:w-auto"
            >
              Start Run
            </button>
            {user ? (
              <div className="atlas-copy allow-wrap self-center text-sm">
                Signed in as <span className="atlas-heading">{user.username}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="atlas-secondary w-full rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors min-[480px]:w-auto"
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
              <div className="allow-wrap absolute left-2 top-2 max-w-[calc(100%_-_1rem)] rounded-sm bg-black/75 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white sm:left-4 sm:top-4 sm:max-w-[calc(100%_-_2rem)] sm:rounded-full sm:px-3 sm:tracking-[0.3em]">
                {collection.label}
              </div>
              {lastResult && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-black/60 px-4 text-center backdrop-blur-[2px]"
                  role="status"
                  aria-live="polite"
                >
                  <div className={`allow-wrap mb-2 text-3xl font-black sm:text-4xl ${lastResult.correct ? 'text-green-300' : 'text-red-300'}`}>
                    {lastResult.correct ? 'Correct' : 'Wrong'}
                  </div>
                  {!lastResult.correct && (
                    <div className="allow-wrap mb-2 max-w-full text-base font-semibold text-white sm:text-lg">
                      {current.name}
                    </div>
                  )}
                  <div className={`text-xl font-bold sm:text-2xl ${lastResult.scoreChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {lastResult.scoreChange > 0 ? `+${lastResult.scoreChange}` : lastResult.scoreChange} pts
                  </div>
                </div>
              )}
            </div>
          )}

          {gameStarted && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="atlas-copy font-mono text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em]">
                  Round {Math.min(roundsPlayed + 1, roundsLimit)} of {roundsLimit}
                </div>
                <div className="atlas-copy text-xs sm:text-sm">
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
                        className={`${buttonClass} allow-wrap w-full rounded-sm border px-4 py-3 text-left text-sm font-medium transition-all sm:py-4 sm:text-base`}
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

      {saveError && (
        <div className="atlas-error allow-wrap rounded-sm px-4 py-3 text-sm" role="alert">
          {saveError}
        </div>
      )}

      {gameOver && (
        <section className="atlas-panel space-y-5 rounded-sm p-5 sm:p-6 md:p-8">
          <h2 className="atlas-heading font-display text-2xl sm:text-3xl">Run complete</h2>
          <div className="grid gap-3 min-[480px]:grid-cols-3">
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
          <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap">
            <button
              type="button"
              className="atlas-primary w-full rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] min-[480px]:w-auto"
              onClick={startGame}
            >
              Play Again
            </button>
            <button
              type="button"
              className="atlas-secondary w-full rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors min-[480px]:w-auto"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${score} on Guess the Flag Name!`)}`
                )
              }
            >
              Share
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

function TypingForm({ submitTyping, disabled, prompt }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      inputRef.current?.focus()
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!query.trim() || disabled) return
    submitTyping(query)
    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} className="scroll-mt-24 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          disabled={disabled}
          name="answer"
          aria-label="Flag answer"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="send"
          placeholder={prompt}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="atlas-control min-w-0 flex-1 rounded-sm px-4 py-3 text-base disabled:opacity-50 sm:text-lg"
        />
        <button
          type="submit"
          disabled={disabled}
          className="atlas-primary w-full rounded-sm px-6 py-3 font-bold transition-colors disabled:opacity-50 sm:w-auto"
        >
          Submit
        </button>
      </div>
    </form>
  )
}

function Stat({ label, value }) {
  return (
    <div className="atlas-status min-w-0 rounded-sm px-4 py-3">
      <div className="atlas-copy allow-wrap text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em]">{label}</div>
      <div className="atlas-heading allow-wrap text-xl font-bold sm:text-2xl">{value}</div>
    </div>
  )
}
