import { useUser } from '../context/UserContext'
import { WeatherIcon } from './WeatherIcon'

export function WeatherWidget() {
  const { settings, weather, weatherLoading, weatherError } = useUser()

  if (!settings.locationEnabled) return null

  if (weatherLoading) {
    return (
      <div className="ml-4 h-8 w-40 rounded-lg shimmer" aria-label="Loading weather" />
    )
  }

  if (weather) {
    return (
      <div
        className="ml-4 flex items-center gap-2 rounded-full border border-app bg-card/60 px-3 py-1.5 text-sm"
        title={`${weather.label} — ${weather.description}`}
      >
        <WeatherIcon
          emoji={weather.icon}
          iconUrl={weather.iconUrl}
          label={weather.label}
          condition={weather.condition}
          size="sm"
        />
        <span className="font-medium">{weather.temp}°C</span>
        <span className="text-muted">{weather.city}</span>
      </div>
    )
  }

  if (weatherError) {
    return (
      <p className="ml-4 text-xs text-amber-400/90" title={weatherError}>
        Weather unavailable
      </p>
    )
  }

  return null
}
