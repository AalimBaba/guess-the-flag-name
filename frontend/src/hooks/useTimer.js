import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useTimer(initialSeconds = 60, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const secondsRef = useRef(initialSeconds)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return undefined
    }

    intervalRef.current = setInterval(() => {
      const next = Math.max(0, secondsRef.current - 1)
      secondsRef.current = next
      setSeconds(next)

      if (next === 0) {
        clearInterval(intervalRef.current)
        setRunning(false)
        onExpireRef.current?.()
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = useCallback(() => {
    secondsRef.current = initialSeconds
    setSeconds(initialSeconds)
    setRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    secondsRef.current = initialSeconds
    setSeconds(initialSeconds)
  }, [initialSeconds])

  return useMemo(
    () => ({ seconds, running, start, stop, reset }),
    [seconds, running, start, stop, reset]
  )
}
