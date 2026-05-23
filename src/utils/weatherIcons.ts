/** OpenWeatherMap condition → display icon (emoji + optional OWM image URL) */

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'haze'
  | 'storm'
  | 'snow'
  | 'wind'

export type WeatherIconDisplay = {
  emoji: string
  label: string
  condition: WeatherCondition
  /** OpenWeatherMap icon image, e.g. https://openweathermap.org/img/wn/10d@2x.png */
  iconUrl: string | null
}

type OwmWeather = {
  id: number
  main: string
  description: string
  icon?: string
}

/**
 * Maps OpenWeatherMap `weather[0]` to the right visual.
 * Uses condition codes first (most accurate), then `main` / description.
 */
export function getWeatherIconDisplay(item?: OwmWeather): WeatherIconDisplay {
  const id = item?.id ?? 800
  const main = item?.main ?? 'Clear'
  const desc = (item?.description ?? '').toLowerCase()
  const iconCode = item?.icon
  const iconUrl = iconCode
    ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    : null

  // —— Sunny / clear ——
  if (id === 800 || main === 'Clear') {
    return { emoji: '☀️', label: 'Sunny', condition: 'sunny', iconUrl }
  }

  // —— Partly cloudy ——
  if (id === 801) {
    return { emoji: '🌤️', label: 'Mostly sunny', condition: 'partly-cloudy', iconUrl }
  }

  // —— Cloudy (overcast) ——
  if ((id >= 802 && id <= 804) || main === 'Clouds') {
    return { emoji: '☁️', label: 'Cloudy', condition: 'cloudy', iconUrl }
  }

  // —— Rain (cloud + rain) ——
  if (id >= 500 && id < 600) {
    const heavy = id >= 502
    return {
      emoji: heavy ? '🌧️' : '🌦️',
      label: heavy ? 'Heavy rain' : 'Rainy',
      condition: 'rainy',
      iconUrl,
    }
  }
  if (id >= 300 && id < 400 || main === 'Drizzle') {
    return { emoji: '🌧️', label: 'Drizzle', condition: 'rainy', iconUrl }
  }
  if (main === 'Rain' || desc.includes('rain')) {
    return { emoji: '🌧️', label: 'Rainy', condition: 'rainy', iconUrl }
  }

  // —— Thunderstorm ——
  if (id >= 200 && id < 300 || main === 'Thunderstorm') {
    return { emoji: '⛈️', label: 'Thunderstorm', condition: 'storm', iconUrl }
  }

  // —— Haze / mist / fog / smoke (atmosphere) — use 💨, not OWM mist image ——
  const hazeDisplay = (label: string): WeatherIconDisplay => ({
    emoji: '💨',
    label,
    condition: 'haze',
    iconUrl: null,
  })

  if (id === 721 || main === 'Haze' || desc.includes('haze')) {
    return hazeDisplay('Haze')
  }
  if (id >= 700 && id < 800) {
    if (id === 741 || main === 'Fog' || desc.includes('fog')) {
      return hazeDisplay('Fog')
    }
    if (id === 701 || main === 'Mist' || desc.includes('mist')) {
      return hazeDisplay('Mist')
    }
    if (main === 'Smoke' || main === 'Dust' || main === 'Sand' || main === 'Ash') {
      return hazeDisplay(main)
    }
    return hazeDisplay('Haze')
  }
  if (main === 'Mist' || main === 'Fog') {
    return hazeDisplay(main)
  }

  // —— Snow ——
  if (id >= 600 && id < 700 || main === 'Snow') {
    return { emoji: '❄️', label: 'Snow', condition: 'snow', iconUrl }
  }

  // —— Wind / squall / tornado ——
  if (main === 'Squall' || main === 'Tornado') {
    return { emoji: '💨', label: main, condition: 'wind', iconUrl }
  }

  return { emoji: '⛅', label: main || 'Weather', condition: 'partly-cloudy', iconUrl }
}
