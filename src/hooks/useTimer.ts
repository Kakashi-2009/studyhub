import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef<(() => void) | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const reset = useCallback(
    (seconds?: number) => {
      clear()
      setIsRunning(false)
      const s = seconds ?? totalSeconds
      setTotalSeconds(s)
      setSecondsLeft(s)
    },
    [clear, totalSeconds]
  )

  const setDuration = useCallback(
    (seconds: number) => {
      setTotalSeconds(seconds)
      setSecondsLeft(seconds)
      setIsRunning(false)
      clear()
    },
    [clear]
  )

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])

  const setOnComplete = useCallback((fn: () => void) => {
    onCompleteRef.current = fn
  }, [])

  useEffect(() => {
    if (!isRunning) {
      clear()
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear()
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clear
  }, [isRunning, clear])

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return {
    secondsLeft,
    isRunning,
    progress,
    totalSeconds,
    start,
    pause,
    reset,
    setDuration,
    setOnComplete,
    formatTime: () => formatTime(secondsLeft),
  }
}
