import type { UserProfile } from '../types'

const AVATAR_COLORS = ['#4FACFE', '#A855F7', '#F472B6', '#22D3EE', '#FBBF24']

function avatarColor(name: string) {
  const code = name.charCodeAt(0) || 65
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

type Props = {
  user: UserProfile
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-2xl',
  lg: 'h-20 w-20 text-3xl',
}

export function UserAvatar({ user, size = 'sm', className = '' }: Props) {
  const dim = SIZES[size]
  const initial = (user.name?.charAt(0) || 'U').toUpperCase()

  if (user.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={`${dim} shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ background: avatarColor(user.name) }}
    >
      {initial}
    </span>
  )
}
