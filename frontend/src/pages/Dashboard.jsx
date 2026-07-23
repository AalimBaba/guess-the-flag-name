import { useEffect, useMemo, useCallback, useRef, useContext } from "react"
import { Fragment} from "react"
import { useTimer } from '../hooks/useTimer'
import { useGameEngine } from '../hooks/useGameEngine'
import FlagCard from '../components/FlagCard'
import Timer from '../components/Timer'
import ScoreBadge from '../components/ScoreBadge'
import ModeToggle from '../components/ModeToggle'
import { api } from '../services/api'
import Globe from '../components/Globe';
import Atlas from '../components/Atlas';
import { collections } from '../data/collections';
import { GameContext } from '../context/GameContext';

export default function Dashboard() {
  const gameContext = useContext(GameContext);

  const {
    mode,
    setMode,
    difficulty,
    setDifficulty,
    answerMode,
    setAnswerMode,
    roundLimit,
    setRoundLimit,
    collectionId,
    setCollectionId,
    addXP,
    addBadge,
    setDailyStreak,
    setLastPlayed,
    addMissedFlag,
    removeMissedFlag,
    addFavoriteFlag,
    removeFavoriteFlag,
    setDailyChallengeSeed,
    resetGameState,
    xp,
    level,
    badges,
    dailyStreak,
    lastPlayed,
    missedFlags,
    favoriteFlags,
    dailyChallengeSeed
  } = gameContext;

  // UI states
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [globeOpen, setGlobeOpen] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);

  // Compute game engine parameters based on mode
  const disableTimer = mode === 'learning' || mode === 'practice';
  const disablePenalties = mode === 'learning' || mode === 'practice';

  const engine = useGameEngine({
    collectionId,
    difficulty,
    roundLimit,
    mode,
    missedFlags,
    answerMode: answerMode === 'multiple' ? 'multiple' : 'typing',
    disableTimer,
    disablePenalties,
    // For daily challenge, we will pass a seed later; we need to modify useGameEngine to accept seed
    // We'll add seed parameter after we update the hook
    seed: mode === 'daily' ? dailyChallengeSeed : undefined,
  });

  const timer = useTimer(60);
  const nextTimeoutRef = useRef(null);

  // Fetch daily challenge seed when mode changes to daily
  useEffect(() => {
    if (mode === 'daily') {
      // Fetch seed from backend
      api.get('/api/daily-challenge')
        .then(response => {
          // Assuming the response contains a seed (string or number)
          const seed = response.data.seed || response.data; // adjust based on actual response
          setDailyChallengeSeed(seed);
        })
        .catch(err => {
          console.error('Failed to fetch daily challenge seed', err);
          // Fallback to a random seed? Or use current timestamp?
          setDailyChallengeSeed(Date.now().toString());
        });
    }
  }, [mode, setDailyChallengeSeed]);

  // Start the game
  const startGame = useCallback(() => {
    engine.reset();
    const item = engine.nextFlag();
    if (item) {
      timer.start()
      setGameStarted(true)
      setGameOver(false)
      setIsProcessing(false)
      setSelectedOption(null)
    }
  }, [engine, timer])

  // Reset when difficulty, mode, collectionId, answerMode, roundLimit changes
  useEffect(() => {
    setGameStarted(false)
    setGameOver(false)
    setIsProcessing(false)
    setSelectedOption(null)
    timer.stop()
    engine.reset()
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
  }, [difficulty, mode, collectionId, answerMode, roundLimit, engine])

  // End game when timer reaches 0 (for timed and daily modes)
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

      // Award XP based on score and streak multipliers
      // We'll calculate XP earned: base XP per correct answer plus streak bonus
      // For simplicity, we award XP equal to the score gained in this game?
      // But score can be negative due to penalties. We'll award XP for correct answers only.
      const correctAnswers = engine.answers.filter(a => a.correct).length;
      const xpEarned = correctAnswers * 10; // 10 XP per correct answer
      // Add streak bonus: for each streak of 5 correct, bonus 50 XP? We'll compute based on engine's streakMax?
      // Actually, we want to award XP during gameplay, not just at the end.
      // We'll change approach: award XP in the game engine or in the answer processing.
      // For now, we'll award XP at the end based on correct answers.
      addXP(xpEarned);

      // Update daily streak if not already played today
      const today = new Date().toISOString().split('T')[0];
      const lastPlayedDate = lastPlayed ? new Date(lastPlayed).toISOString().split('T')[0] : null;
      if (lastPlayedDate !== today) {
        setDailyStreak(prev => prev + 1);
        setLastPlayed(new Date().toISOString());
      }

      // Save game to backend
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
  }, [timer.seconds, gameStarted, engine, mode, difficulty, addXP, setDailyStreak, setLastPlayed, lastPlayed, api])

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
  const openGlobe = () => setGlobeOpen(true);
  const closeGlobe = () => setGlobeOpen(false);
  const openAtlas = () => setAtlasOpen(true);
  const closeAtlas = () => setAtlasOpen(false);
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <ModeToggle
            collectionId={collectionId}
            setCollectionId={setCollectionId}
            gameMode={mode}
            setGameMode={setMode}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            answerMode={answerMode}
            setAnswerMode={setAnswerMode}
            roundLimit={roundLimit}
            setRoundLimit={setRoundLimit}
            collections={collections}
          />
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
                {answerMode === 'typing' ? (
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
                  %>
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
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4">
        <button onClick={openAtlas} className="px-3 py-2 bg-brand-600 hover:bg-brand-500 rounded text-sm">
          Atlas
        </button>
        <span className="text-sm text-slate-400">Created by Aalim</span>
        <button onClick={openGlobe} className="px-3 py-2 bg-brand-600 hover:bg-brand-500 rounded text-sm">
          Globe
        </button>
      </div>

      <>
        {globeOpen && <Globe onClose={closeGlobe} />}
        {atlasOpen && <Atlas onClose={closeAtlas} />}
      </>
    </>
  );
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
