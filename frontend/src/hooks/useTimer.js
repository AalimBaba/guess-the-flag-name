import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

export function useTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => (s > 0 ? s - 1 : 0))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = useCallback(() => {
    setSeconds(initialSeconds)
    setRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
  }, [initialSeconds])

  return useMemo(() => ({
    seconds, running, start, stop, reset
  }), [seconds, running, start, stop, reset])
}
