import type { WeatherCondition } from '../utils/weatherIcons'

type Props = {
  emoji: string
  iconUrl: string | null
  label: string
  condition: WeatherCondition
  size?: 'sm' | 'md'
}

const CONDITION_GLOW: Record<WeatherCondition, string> = {
  sunny: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]',
  'partly-cloudy': '',
  cloudy: '',
  rainy: 'drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]',
  haze: 'drop-shadow-[0_0_6px_rgba(148,163,184,0.45)]',
  storm: 'drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]',
  snow: 'drop-shadow-[0_0_6px_rgba(186,230,253,0.5)]',
  wind: '',
}

export function WeatherIcon({ emoji, iconUrl, label, condition, size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'
  const textSize = size === 'sm' ? 'text-base' : 'text-xl'

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={label}
        title={label}
        className={`${dim} object-contain ${CONDITION_GLOW[condition]}`}
      />
    )
  }

  return (
    <span
      className={`${textSize} leading-none ${CONDITION_GLOW[condition]}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {emoji}
    </span>
  )
}
