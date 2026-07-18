import { useCallback, useMemo, useRef, useState } from 'react'
import { collectionList, getCollectionById } from '../data/collections'

const DIFFICULTY_RANK = {
  easy: 0,
  medium: 1,
  hard: 2,
}

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
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

function shuffle(items) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

export function useGameEngine({ collectionId = 'nations', difficulty = 'medium', roundLimit = 10 }) {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())
  const [usedIds, setUsedIds] = useState([])
  const [current, setCurrent] = useState(null)
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [streakMax, setStreakMax] = useState(0)
  const [answers, setAnswers] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const roundStartedAt = useRef(0)

  const collection = useMemo(() => getCollectionById(collectionId) || collectionList[0], [collectionId])

  const pool = useMemo(() => {
    if (!collection) return []
    const selectedRank = DIFFICULTY_RANK[difficulty] ?? DIFFICULTY_RANK.medium
    const filtered = collection.collections.filter((entry) => (DIFFICULTY_RANK[entry.difficulty] ?? 2) <= selectedRank)
    return filtered.length > 0 ? filtered : collection.collections
  }, [collection, difficulty])

  const hasMore = usedIds.length < Math.min(roundLimit, pool.length)

  const reset = useCallback(() => {
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

  const nextFlag = useCallback(() => {
    const remaining = pool.filter((entry) => !usedIds.includes(entry.id))
    if (remaining.length === 0 || usedIds.length >= roundLimit) {
      setCurrent(null)
      return null
    }
    const next = pickRandom(remaining)
    setCurrent(next)
    setUsedIds((prev) => [...prev, next.id])
    setLastResult(null)
    roundStartedAt.current = performance.now()
    return next
  }, [pool, roundLimit, usedIds])

  const submitAnswer = useCallback(
    (guess) => {
      if (!current) return null
      const correct = isAliasMatch(current, guess)
      const elapsed = roundStartedAt.current ? Math.max(0, Math.round(performance.now() - roundStartedAt.current)) : 0
      const scoreChange = correct ? 10 + Math.min(streak, 5) : -4

      setScore((value) => Math.max(0, value + scoreChange))
      setStreak((value) => {
        const next = correct ? value + 1 : 0
        setStreakMax((max) => Math.max(max, next))
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
    [current, streak]
  )

  const optionsForCurrent = useCallback(() => {
    if (!current) return []
    const options = [current]
    const others = pool.filter((entry) => entry.id !== current.id)
    while (options.length < 4 && others.length > 0) {
      const candidate = pickRandom(others)
      if (!options.find((item) => item.id === candidate.id)) {
        options.push(candidate)
      }
      const index = others.findIndex((item) => item.id === candidate.id)
      if (index >= 0) others.splice(index, 1)
    }
    return shuffle(options)
  }, [current, pool])

  return useMemo(
    () => ({
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
      nextFlag,
      reset,
      submitAnswer,
      optionsForCurrent,
    }),
    [
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
      nextFlag,
      reset,
      submitAnswer,
      optionsForCurrent,
    ]
  )
}
