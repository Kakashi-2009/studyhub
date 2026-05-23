import { useGoogleLogin } from '@react-oauth/google'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  DEFAULT_SETTINGS,
  DEFAULT_USER,
  getDefaultWeeklyProgress,
  STORAGE_KEYS,
  type AppSettings,
  type DayData,
  type UserProfile,
} from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWeather, type WeatherData } from '../hooks/useWeather'
import { DAY_LABELS, getTodayIndex } from '../utils/timeGreeting'
import { fetchGoogleUserInfo, isGoogleClientConfigured } from '../utils/googleAuth'
import { clearUser, isLoggedIn, loadUser, saveUser } from '../utils/userStorage'

type UserContextValue = {
  user: UserProfile
  setUser: (u: UserProfile | ((p: UserProfile) => UserProfile)) => void
  isLoggedIn: boolean
  authLoading: boolean
  signInWithGoogle: () => void
  signOut: () => void
  switchAccount: () => void
  loginWithEmail: (email: string, password: string) => boolean
  settings: AppSettings
  setSettings: (s: AppSettings | ((p: AppSettings) => AppSettings)) => void
  progress: DayData[]
  setProgress: (p: DayData[] | ((prev: DayData[]) => DayData[])) => void
  incrementPractice: (amount?: number) => void
  incrementTheory: (amount?: number) => void
  incrementLexicon: (amount?: number) => void
  settingsOpen: boolean
  setSettingsOpen: (v: boolean) => void
  calculatorOpen: boolean
  setCalculatorOpen: (v: boolean) => void
  toast: string | null
  showToast: (msg: string) => void
  analyticsBanner: boolean
  weather: WeatherData | null
  weatherLoading: boolean
  weatherError: string | null
  refreshWeather: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UserProfile>(STORAGE_KEYS.user, DEFAULT_USER)
  const [settings, setSettings] = useLocalStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  const [progress, setProgress] = useLocalStorage<DayData[]>(
    STORAGE_KEYS.progress,
    getDefaultWeeklyProgress()
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const { weather, loading: weatherLoading, error: weatherError, refreshWeather } = useWeather(settings)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const completeGoogleLogin = useCallback(
    async (accessToken: string) => {
      setAuthLoading(true)
      try {
        const profile = await fetchGoogleUserInfo(accessToken)
        const newUser: UserProfile = {
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          provider: 'google',
          loggedInAt: new Date().toISOString(),
        }
        saveUser(newUser)
        setUser(newUser)
        showToast(`Welcome, ${profile.name}! 👋`)
      } catch {
        showToast('Login failed. Please try again.')
      } finally {
        setAuthLoading(false)
      }
    },
    [setUser, showToast]
  )

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        completeGoogleLogin(tokenResponse.access_token)
      } else {
        showToast('Login failed. Please try again.')
      }
    },
    onError: () => showToast('Login cancelled'),
  })

  const signInWithGoogle = useCallback(() => {
    if (!isGoogleClientConfigured()) {
      showToast('Google login not configured. Please add your Client ID.')
      return
    }
    googleLogin()
  }, [googleLogin, showToast])

  const signOut = useCallback(() => {
    clearUser()
    setUser({ ...DEFAULT_USER })
    showToast('Signed out successfully')
  }, [setUser, showToast])

  const switchAccount = useCallback(() => {
    clearUser()
    setUser({ ...DEFAULT_USER })
    setTimeout(() => signInWithGoogle(), 150)
  }, [setUser, signInWithGoogle])

  const loginWithEmail = useCallback(
    (email: string, password: string) => {
      if (!email.trim() || !password.trim()) {
        showToast('Enter email and password')
        return false
      }
      const newUser: UserProfile = {
        name: email.split('@')[0] || 'User',
        email: email.trim(),
        provider: 'email',
        loggedInAt: new Date().toISOString(),
      }
      saveUser(newUser)
      setUser(newUser)
      showToast(`Welcome, ${newUser.name}! 👋`)
      return true
    },
    [setUser, showToast]
  )

  // Restore session on app load
  useEffect(() => {
    const saved = loadUser()
    if (saved?.provider) {
      setUser(saved)
    }
  }, [setUser])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor)
    const map: Record<string, string> = {
      '#4FACFE': '#A855F7',
      '#A855F7': '#F472B6',
      '#F472B6': '#22D3EE',
      '#22D3EE': '#FBBF24',
      '#FBBF24': '#4FACFE',
    }
    document.documentElement.style.setProperty('--accent-2', map[settings.accentColor] ?? '#A855F7')
  }, [settings.accentColor])

  useEffect(() => {
    const scale = settings.fontSize === 'small' ? 0.9 : settings.fontSize === 'large' ? 1.1 : 1
    document.documentElement.style.setProperty('--font-scale', String(scale))
  }, [settings.fontSize])

  const updateToday = (fn: (day: DayData) => DayData) => {
    const idx = getTodayIndex()
    setProgress((prev) => {
      const next = [...prev]
      const i = next.findIndex((d) => d.day === DAY_LABELS[idx])
      if (i >= 0) next[i] = fn(next[i])
      else next[idx] = fn({ day: DAY_LABELS[idx], theory: 0, practice: 0, lexicon: 0 })
      return next
    })
  }

  const incrementPractice = (amount = 5) => {
    updateToday((d) => ({ ...d, practice: Math.min(100, d.practice + amount) }))
  }

  const incrementTheory = (amount = 5) => {
    updateToday((d) => ({ ...d, theory: Math.min(100, d.theory + amount) }))
  }

  const incrementLexicon = (amount = 5) => {
    updateToday((d) => ({ ...d, lexicon: Math.min(100, d.lexicon + amount) }))
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: isLoggedIn(user),
        authLoading,
        signInWithGoogle,
        signOut,
        switchAccount,
        loginWithEmail,
        settings,
        setSettings,
        progress,
        setProgress,
        incrementPractice,
        incrementTheory,
        incrementLexicon,
        settingsOpen,
        setSettingsOpen,
        calculatorOpen,
        setCalculatorOpen,
        toast,
        showToast,
        analyticsBanner: settings.dataCollection,
        weather,
        weatherLoading,
        weatherError,
        refreshWeather,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
