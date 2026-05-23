import { DEFAULT_USER, STORAGE_KEYS, type UserProfile } from '../types'

/** Persist user session (swap for API call later). */
export function saveUser(user: UserProfile): UserProfile {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  return user
}

export function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEYS.user)
}

export function isLoggedIn(user: UserProfile): boolean {
  return user.provider === 'google' || user.provider === 'email'
}

export function getGuestUser(): UserProfile {
  return { ...DEFAULT_USER }
}
