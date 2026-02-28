import { useMemo, useState, useCallback } from 'react'
import flags from '../assets/flags.json'

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function useGameEngine({ difficulty = 'medium' }) {
  const pool = useMemo(() => flags.filter((f) => f.difficulty === difficulty || difficulty === 'medium'), [difficulty])
  const [used, setUsed] = useState(new Set())
  const [current, setCurrent] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [streakMax, setStreakMax] = useState(0)
  const [answers, setAnswers] = useState([])
  const [lastResult, setLastResult] = useState(null) // { correct: boolean, scoreChange: number, country: string }

  const nextFlag = useCallback(() => {
    if (used.size === pool.length) return null
    setLastResult(null)
    let item = null
    let attempts = 0
    do {
      item = pickRandom(pool)
      attempts++
    } while (used.has(item.code) && attempts < 50)
    setUsed((prev) => new Set(prev).add(item.code))
    setCurrent(item)
    return item
  }, [pool, used])

  const checkAnswer = useCallback((input) => {
    if (!current) return false
    const normalizedInput = input.trim().toLowerCase()
    const normalizedName = current.name.trim().toLowerCase()
    
    // Exact match or very close match
    const correct =
      normalizedInput === normalizedName ||
      normalizedName.includes(normalizedInput) ||
      levenshtein(normalizedInput, normalizedName) <= 2
    
    let change = 0
    if (correct) {
      change = 10 + (streak > 0 ? 5 : 0)
      setScore((s) => s + change)
      setStreak((s) => {
        const next = s + 1
        setStreakMax((m) => Math.max(m, next))
        return next
      })
    } else {
      change = -5
      setScore((s) => Math.max(0, s + change)) // Don't let score go below 0
      setStreak(0)
    }

    const result = { correct, scoreChange: change, country: current.name }
    setLastResult(result)
    setAnswers((a) => [...a, { country: current.name, correct, timeMs: 0 }])
    
    return result
  }, [current, streak])

  const optionsForCurrent = useCallback(() => {
    if (!current) return []
    const opts = [current]
    while (opts.length < 4) {
      const candidate = pickRandom(pool)
      if (!opts.find((o) => o.code === candidate.code)) opts.push(candidate)
    }
    return shuffle(opts)
  }, [current, pool])

  const reset = useCallback(() => {
    setUsed(new Set())
    setCurrent(null)
    setScore(0)
    setStreak(0)
    setStreakMax(0)
    setAnswers([])
    setLastResult(null)
  }, [])

  return useMemo(() => ({
    pool, used, current, score, streak, streakMax, answers, lastResult, nextFlag, checkAnswer, optionsForCurrent, reset
  }), [pool, used, current, score, streak, streakMax, answers, lastResult, nextFlag, checkAnswer, optionsForCurrent, reset])
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function levenshtein(a, b) {
  const matrix = []
  const aLen = a.length
  const bLen = b.length
  for (let i = 0; i <= bLen; i++) matrix[i] = [i]
  for (let j = 0; j <= aLen; j++) matrix[0][j] = j
  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
    }
  }
  return matrix[bLen][aLen]
}
