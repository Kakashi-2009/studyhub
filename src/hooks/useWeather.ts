import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppSettings } from '../types'
import { getWeatherIconDisplay, type WeatherCondition } from '../utils/weatherIcons'

export type WeatherData = {
  temp: number
  city: string
  /** Emoji shown in UI (☀️ sunny, ☁️/🌧️ rain, 🌫️ haze, etc.) */
  icon: string
  /** OpenWeatherMap icon image URL when available */
  iconUrl: string | null
  label: string
  condition: WeatherCondition
  description: string
}

function parseWeatherResponse(data: {
  name: string
  main: { temp: number }
  weather?: { id: number; main: string; description: string; icon?: string }[]
}): WeatherData {
  const w = data.weather?.[0]
  const display = getWeatherIconDisplay(w)
  return {
    temp: Math.round(data.main.temp),
    city: data.name,
    icon: display.emoji,
    iconUrl: display.iconUrl,
    label: display.label,
    condition: display.condition,
    description: w?.description ?? '',
  }
}

export function useWeather(settings: AppSettings) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const getApiKey = () => {
    const key = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!key || key === 'your_key_here') return null
    return key
  }

  const fetchByCity = useCallback(async (city: string) => {
    const key = getApiKey()
    if (!key) {
      setError('Add VITE_OPENWEATHER_API_KEY to .env')
      setWeather(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`,
        { signal: controller.signal }
      )
      if (!res.ok) throw new Error('City not found')
      const data = await res.json()
      if (requestId !== requestIdRef.current) return
      setWeather(parseWeatherResponse(data))
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (requestId !== requestIdRef.current) return
      setWeather(null)
      setError('Could not load weather for that city')
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    const key = getApiKey()
    if (!key) {
      setError('Add VITE_OPENWEATHER_API_KEY to .env')
      setWeather(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`,
        { signal: controller.signal }
      )
      if (!res.ok) throw new Error('Weather fetch failed')
      const data = await res.json()
      if (requestId !== requestIdRef.current) return
      setWeather(parseWeatherResponse(data))
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (requestId !== requestIdRef.current) return
      setWeather(null)
      setError('Could not load weather')
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  const refreshWeather = useCallback(() => {
    const city = settings.cityOverride.trim()
    if (!settings.locationEnabled) {
      setWeather(null)
      setError(null)
      return
    }
    if (city) {
      fetchByCity(city)
      return
    }
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false)
        setError('Location permission denied — enter your city below')
      }
    )
  }, [settings.locationEnabled, settings.cityOverride, fetchByCity, fetchByCoords])

  // Debounce city changes so weather updates shortly after the user types
  useEffect(() => {
    if (!settings.locationEnabled) {
      setWeather(null)
      setError(null)
      return
    }

    const city = settings.cityOverride.trim()
    if (city) {
      const timer = setTimeout(() => fetchByCity(city), 500)
      return () => clearTimeout(timer)
    }

    refreshWeather()
  }, [settings.locationEnabled, settings.cityOverride, fetchByCity, refreshWeather])

  return { weather, loading, error, refreshWeather, fetchByCity }
}
