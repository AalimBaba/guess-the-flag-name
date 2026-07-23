import { useCallback, useMemo, useRef, useState } from 'react'
import { collectionList, getCollectionById } from '../data/collections'

// Simple LCG for seeded random
function createSeededRandom(seed) {
  // Use xorshift64* or a simple LCG
  // We'll use a simple one: seed = (seed * 9301 + 49297) % 233280
  // Return a function that returns a float between 0 and 1
  let s = seed !== null && seed !== undefined ? seed : Date.now()
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

function isAliasMatch(entry, guess) {
  const normalizedGuess = normalize(guess)
  if (!normalizedGuess) return false
  const aliases = [entry.name, ...(entry.aliases || [])]
  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias)
    return (
      normalizedGuess === normalizedAlias ||
      normalizedGuess.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedGuess)
    )
  })
}

function shuffle(items, random) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[next[index], next[randomIndex]] = [next[randomIndex], next[index]]
  }
  return next
}

function pickRandom(items, random) {
  return items[Math.floor(random() * items.length)]
}

export function useGameEngine({
  collectionId = 'nations',
  difficulty = 'medium',
  roundLimit = 10,
  mode = 'timed', // 'learning', 'practice', 'timed', 'daily'
  missedFlags = [], // array of flag IDs for practice mode
  disableTimer = false, // if true, timer doesn't auto-end game (and disables per-round timer for scoring?)
  disablePenalties = false, // if true, wrong answers don't penalize score
  answerMode = 'typing', // 'typing', 'multiple' - not used in engine, but kept for consistency
  seed = null, // seed for daily challenge mode
}) {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())
  const [usedIds, setUsedIds] = useState([])
  const [current, setCurrent] = useState(null)
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [streakMax, setStreakMax] = useState(0)
  const [answers, setAnswers] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const usedIdsRef = useRef(new Set())
  const roundStartedAt = useRef(0)

  // Create seeded random if seed is provided
  const seededRandom = useMemo(() => {
    if (seed !== null && seed !== undefined) {
      return createSeededRandom(seed)
    }
    return null
  }, [seed])

  // Function to get random number: seeded if available, else Math.random
  const getRandom = useCallback(() => {
    if (seededRandom) {
      return seededRandom()
    }
    return Math.random()
  }, [seededRandom])

  const collection = useMemo(() => getCollectionById(collectionId) || collectionList[0], [collectionId])

  const DIFFICULTY_RANK = {
    easy: 0,
    medium: 1,
    hard: 2,
  }

  const basePool = useMemo(() => {
    if (!collection) return []
    const selectedRank = DIFFICULTY_RANK[difficulty] ?? DIFFICULTY_RANK.medium
    const filtered = collection.collections.filter(
      (entry) => (DIFFICULTY_RANK[entry.difficulty] ?? DIFFICULTY_RANK.hard) <= selectedRank
    )
    return filtered.length > 0 ? filtered : collection.collections
  }, [collection, difficulty])

  // Apply mode-specific filters
  const pool = useMemo(() => {
    if (!basePool) return []
    if (mode === 'practice' && missedFlags.length > 0) {
      // Filter to only include flags that are in missedFlags
      return basePool.filter((entry) => missedFlags.includes(entry.id))
    }
    // For other modes, use the full basePool
    return basePool
  }, [basePool, mode, missedFlags])

  // If in practice mode and no missed flags, we fall back to basePool to avoid breaking
  const effectivePool = pool.length > 0 ? pool : basePool

  const targetRounds = Math.min(roundLimit, effectivePool.length)
  const hasMore = usedIds.length < targetRounds

  const reset = useCallback(() => {
    usedIdsRef.current = new Set()
    setSessionId(crypto.randomUUID())
    setUsedIds([])
    setCurrent(null)
    setRoundsPlayed(0)
    setScore(0)
    setStreak(0)
    setStreakMax(0)
    setAnswers([])
    setLastResult(null)
    roundStartedAt.current = 0
  }, [])

  const startSession = useCallback(() => {
    const first = effectivePool.length > 0 && targetRounds > 0 ? pickRandom(effectivePool, getRandom) : null
    const nextUsedIds = new Set(first ? [first.id] : [])
    usedIdsRef.current = nextUsedIds
    setSessionId(crypto.randomUUID())
    setUsedIds([...nextUsedIds])
    setCurrent(first)
    setRoundsPlayed(0)
    setScore(0)
    setStreak(0)
    setStreakMax(0)
    setAnswers([])
    setLastResult(null)
    roundStartedAt.current = first ? performance.now() : 0
    return first
  }, [effectivePool, targetRounds, getRandom])

  const nextFlag = useCallback(() => {
    const used = usedIdsRef.current
    if (used.size >= targetRounds) {
      setCurrent(null)
      return null
    }

    const remaining = effectivePool.filter((entry) => !used.has(entry.id))
    if (remaining.length === 0) {
      setCurrent(null)
      return null
    }

    const next = pickRandom(remaining, getRandom)
    const nextUsedIds = new Set(used)
    nextUsedIds.add(next.id)
    usedIdsRef.current = nextUsedIds
    setUsedIds([...nextUsedIds])
    setCurrent(next)
    setLastResult(null)
    // Only start the round timer if not in learning mode and timer is not disabled
    if (mode !== 'learning' && !disableTimer) {
      roundStartedAt.current = performance.now()
    }
    return next
  }, [effectivePool, targetRounds, mode, disableTimer, getRandom])

  const submitAnswer = useCallback(
    (guess) => {
      if (!current) return null
      const correct = isAliasMatch(current, guess)
      const elapsed = !disableTimer && mode !== 'learning' && roundStartedAt.current
        ? Math.max(0, Math.round(performance.now() - roundStartedAt.current))
        : 0
      let scoreChange = 0
      if (correct) {
        // Base points for correct answer
        scoreChange = 10
        // Streak bonus: 5 points per consecutive correct, up to a max of 5 (so 25 extra)
        const streakBonus = Math.min(streak, 5) * 5
        scoreChange += streakBonus
      } else {
        // Only apply penalty if not disabled
        if (!disablePenalties) {
          scoreChange = -5
        }
      }

      setScore((value) => Math.max(0, value + scoreChange))
      setStreak((value) => {
        const next = correct ? value + 1 : 0
        setStreakMax((maximum) => Math.max(maximum, next))
        return next
      })
      setRoundsPlayed((value) => value + 1)

      const result = {
        correct,
        scoreChange,
        prompt: current.name,
        guess: String(guess ?? ''),
        timeMs: elapsed,
        itemId: current.id,
      }

      setAnswers((value) => [...value, result])
      setLastResult(result)
      return result
    },
    [current, streak, disablePenalties, disableTimer, mode]
  )

  const optionsForCurrent = useCallback(() => {
    if (!current) return []
    const options = [current]
    const others = effectivePool.filter((entry) => entry.id !== current.id)

    while (options.length < 4 && others.length > 0) {
      const candidate = pickRandom(others, getRandom)
      options.push(candidate)
      others.splice(others.indexOf(candidate), 1)
    }

    return shuffle(options, getRandom)
  }, [current, effectivePool, getRandom])

  return useMemo(
    () => ({
      sessionId,
      collection,
      pool: effectivePool,
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
      reset,
      submitAnswer,
      optionsForCurrent,
    }),
    [
      sessionId,
      collection,
      effectivePool,
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
      reset,
      submitAnswer,
      optionsForCurrent,
    ]
  )
}