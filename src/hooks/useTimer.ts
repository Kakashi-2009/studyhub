import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds)
  /** Elapsed fraction 0–1, updated every 100ms for smooth ring animation */
  const [progressExact, setProgressExact] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const deadlineRef = useRef<number | null>(null)
  const onCompleteRef = useRef<(() => void) | null>(null)
  const secondsLeftRef = useRef(secondsLeft)
  const isRunningRef = useRef(isRunning)

  secondsLeftRef.current = secondsLeft
  isRunningRef.current = isRunning

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const syncFromDeadline = useCallback(() => {
    if (deadlineRef.current === null) return false
    const remainingMs = deadlineRef.current - Date.now()
    if (remainingMs <= 0) {
      setSecondsLeft(0)
      setProgressExact(totalSeconds > 0 ? 1 : 0)
      setIsRunning(false)
      deadlineRef.current = null
      clear()
      onCompleteRef.current?.()
      return true
    }
    setSecondsLeft(Math.ceil(remainingMs / 1000))
    setProgressExact(totalSeconds > 0 ? 1 - remainingMs / (totalSeconds * 1000) : 0)
    return false
  }, [totalSeconds, clear])

  const reset = useCallback(
    (seconds?: number) => {
      clear()
      deadlineRef.current = null
      setIsRunning(false)
      const s = seconds ?? totalSeconds
      setTotalSeconds(s)
      setSecondsLeft(s)
      setProgressExact(0)
    },
    [clear, totalSeconds]
  )

  const setDuration = useCallback(
    (seconds: number) => {
      clear()
      deadlineRef.current = null
      setTotalSeconds(seconds)
      setSecondsLeft(seconds)
      setProgressExact(0)
      setIsRunning(false)
    },
    [clear]
  )

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    if (deadlineRef.current !== null) {
      const remainingMs = Math.max(0, deadlineRef.current - Date.now())
      setSecondsLeft(Math.ceil(remainingMs / 1000))
      setProgressExact(totalSeconds > 0 ? 1 - remainingMs / (totalSeconds * 1000) : 0)
      deadlineRef.current = null
    }
    clear()
    setIsRunning(false)
  }, [totalSeconds, clear])

  const setOnComplete = useCallback((fn: () => void) => {
    onCompleteRef.current = fn
  }, [])

  useEffect(() => {
    if (!isRunning) return

    // Wall-clock deadline — immune to setInterval drift and background tab throttling
    deadlineRef.current = Date.now() + secondsLeftRef.current * 1000

    const tick = () => syncFromDeadline()

    tick()
    intervalRef.current = setInterval(tick, 100)

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isRunningRef.current) {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clear()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [isRunning, clear, syncFromDeadline])

  const progress =
    isRunning || progressExact > 0
      ? progressExact
      : totalSeconds > 0
        ? 1 - secondsLeft / totalSeconds
        : 0

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
