import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useTimer } from '../hooks/useTimer'
import { useGameEngine } from '../hooks/useGameEngine'
import FlagCard from '../components/FlagCard'
import Timer from '../components/Timer'
import ScoreBadge from '../components/ScoreBadge'
import ModeToggle from '../components/ModeToggle'
import { api } from '../services/api'

export default function Dashboard() {
  const [mode, setMode] = useState('typing')
  const [difficulty, setDifficulty] = useState('medium')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  
  const engine = useGameEngine({ difficulty, mode })
  const timer = useTimer(60)
  const nextTimeoutRef = useRef(null)

  // Start the game
  const startGame = useCallback(() => {
    engine.reset()
    const item = engine.nextFlag()
    if (item) {
      timer.start()
      setGameStarted(true)
      setGameOver(false)
      setIsProcessing(false)
      setSelectedOption(null)
    }
  }, [engine, timer])

  // Reset when difficulty or mode changes
  useEffect(() => {
    setGameStarted(false)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    timer.stop()
    engine.reset()
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
  }, [difficulty, mode])

  // End game when timer reaches 0
  useEffect(() => {
    if (gameStarted && timer.seconds === 0) {
      setGameStarted(false)
      setGameOver(true)
      timer.stop()
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)

      const accuracy =
        engine.answers.length === 0
          ? 0
          : Math.round(
              (engine.answers.filter((a) => a.correct).length / engine.answers.length) * 100
            )
      
      api
        .post('/game/save', {
          score: engine.score,
          accuracy,
          mode,
          difficulty,
          streakMax: engine.streakMax,
          answers: engine.answers,
        })
        .catch((err) => console.error('Failed to save game', err))
    }
  }, [timer.seconds, gameStarted, engine, mode, difficulty])

  const handleNext = useCallback(() => {
    setIsProcessing(false)
    setSelectedOption(null)
    const item = engine.nextFlag()
    if (!item) {
      // Pool exhausted
      setGameStarted(false)
      setGameOver(true)
      timer.stop()
    }
  }, [engine, timer])

  const submitTyping = (value) => {
    if (isProcessing) return
    setIsProcessing(true)
    engine.checkAnswer(value)
    
    // Auto advance after delay
    nextTimeoutRef.current = setTimeout(handleNext, 1500)
  }

  const chooseOption = (name) => {
    if (isProcessing) return
    setIsProcessing(true)
    setSelectedOption(name)
    engine.checkAnswer(name)
    
    // Auto advance after delay
    nextTimeoutRef.current = setTimeout(handleNext, 1500)
  }

  const options = useMemo(() => {
    if (!gameStarted || !engine.current) return []
    return engine.optionsForCurrent()
  }, [engine.current, gameStarted])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <ModeToggle mode={mode} setMode={setMode} difficulty={difficulty} setDifficulty={setDifficulty} />
        <div className="flex items-center gap-3">
          <Timer seconds={timer.seconds} />
          <ScoreBadge score={engine.score} streak={engine.streak} />
        </div>
      </div>

      {!gameStarted && !gameOver ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-slate-900/40 rounded-2xl border border-slate-800">
          <h2 className="text-3xl font-bold">Ready to play?</h2>
          <p className="text-slate-400">Mode: <span className="capitalize text-white">{mode}</span> | Difficulty: <span className="capitalize text-white">{difficulty}</span></p>
          <button 
            onClick={startGame}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {engine.current && (
            <div className="relative">
              <FlagCard code={engine.current.code} />
              
              {/* Feedback Overlay */}
              {engine.lastResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl animate-in zoom-in duration-200">
                  <div className={`text-4xl font-black mb-2 ${engine.lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {engine.lastResult.correct ? 'CORRECT!' : 'WRONG!'}
                  </div>
                  {!engine.lastResult.correct && (
                    <div className="text-xl font-bold text-white mb-2">
                      It was {engine.lastResult.country}
                    </div>
                  )}
                  <div className={`text-2xl font-bold ${engine.lastResult.scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {engine.lastResult.scoreChange > 0 ? `+${engine.lastResult.scoreChange}` : engine.lastResult.scoreChange} pts
                  </div>
                </div>
              )}
            </div>
          )}

          {gameStarted && (
            <div className="mt-4">
              {mode === 'typing' ? (
                <TypingForm 
                  key={engine.current?.code} 
                  submitTyping={submitTyping} 
                  disabled={isProcessing} 
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {options.map((opt) => {
                    const isCorrect = opt.name === engine.current?.name
                    const isSelected = opt.name === selectedOption
                    
                    let btnClass = "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    if (isProcessing) {
                      if (isCorrect) btnClass = "bg-green-600/40 border-green-500 text-green-100"
                      else if (isSelected) btnClass = "bg-red-600/40 border-red-500 text-red-100"
                      else btnClass = "bg-slate-800/40 border-slate-800 opacity-50"
                    }

                    return (
                      <button
                        key={opt.code}
                        disabled={isProcessing}
                        onClick={() => chooseOption(opt.name)}
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
        </>
      )}

      {gameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-8 shadow-2xl">
            <h3 className="text-3xl font-bold mb-4 text-center">Time's up! 🏁</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                <span>Final Score</span>
                <span className="text-2xl font-bold text-brand-400">{engine.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                <span>Accuracy</span>
                <span className="text-xl font-bold">
                  {engine.answers.length
                    ? Math.round(
                        (engine.answers.filter((a) => a.correct).length / engine.answers.length) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                <span>Best Streak</span>
                <span className="text-xl font-bold text-green-400">{engine.streakMax}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-3 font-bold transition-colors"
                onClick={startGame}
              >
                Play Again
              </button>
              <button
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-6 py-3 transition-colors"
                onClick={() => window.open('https://twitter.com/intent/tweet?text=I%20scored%20' + engine.score + '%20on%20Guess%20the%20Flag!')}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TypingForm({ submitTyping, disabled }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim() || disabled) return
    submitTyping(query)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          autoFocus
          disabled={disabled}
          name="answer"
          placeholder="Type country name..."
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
