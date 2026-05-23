import { createContext, useContext, type ReactNode } from 'react'
import { useTheme, type Theme } from '../hooks/useTheme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme | ((prev: Theme) => Theme)) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider')
  return ctx
}
