import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  }

  const [stored, setStored] = useState<T>(read)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(stored))
    } catch {
      // quota exceeded
    }
  }, [key, stored])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored((prev) => (typeof value === 'function' ? (value as (p: T) => T)(prev) : value))
  }, [])

  return [stored, setValue] as const
}
