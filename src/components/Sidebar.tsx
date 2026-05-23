import { motion } from 'framer-motion'
import {
  Bookmark,
  Calculator,
  ChevronDown,
  FolderOpen,
  Grid3X3,
  Moon,
  NotepadText,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useThemeContext } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { UserAvatar } from './UserAvatar'

const NAV = [
  { to: '/', label: 'Dashboard', icon: Grid3X3 },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/files', label: 'Files', icon: FolderOpen },
  { to: '/notes', label: 'Notes', icon: NotepadText },
  { to: '/skills', label: 'Skills', icon: Sparkles },
  { to: '#calculator', label: 'Calculator', icon: Calculator, action: 'calculator' as const },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const { toggleTheme, isDark } = useThemeContext()
  const { user, setCalculatorOpen, signOut, switchAccount, setSettingsOpen } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'Sign Out') signOut()
    if (action === 'Switch Account') switchAccount()
    if (action === 'Edit Profile') setSettingsOpen(true)
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col bg-sidebar border-r border-app transition-colors duration-300">
      <div className="p-6">
        <div className="font-heading text-2xl font-bold text-app">
          Study
          <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-sm font-semibold text-amber-950">
            hub
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon
          const isCalc = item.action === 'calculator'
          const active = !isCalc && pathname === item.to

          if (isCalc) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setCalculatorOpen(true)}
                className="relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted transition hover:text-app"
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          }

          return (
            <NavLink key={item.to} to={item.to} className="relative block">
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  active ? 'text-white' : 'text-muted hover:text-app'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-app px-4 py-4 space-y-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 text-sm text-muted hover:text-app"
        >
          <Sun size={16} />
          Light Mode
        </button>
        <div className="flex items-center justify-between rounded-xl bg-card/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-app">
            <Moon size={16} />
            Dark Mode
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-6 w-11 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-0.5"
            aria-label="Toggle theme"
          >
            <motion.span
              className="block h-5 w-5 rounded-full bg-white shadow"
              animate={{ x: isDark ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-app p-4">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-card/50"
        >
          <UserAvatar user={user} size="sm" />
          <span className="flex-1 text-left text-sm font-medium text-app">{user.name}</span>
          <ChevronDown size={16} className={`text-muted transition ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 overflow-hidden rounded-xl border border-app bg-card py-1"
          >
            {['Switch Account', 'Edit Profile', 'Sign Out'].map((label) => (
              <button
                key={label}
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-app"
                onClick={() => handleMenuAction(label)}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </aside>
  )
}
