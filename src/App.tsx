import { GoogleOAuthProvider } from '@react-oauth/google'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { isGoogleClientConfigured } from './utils/googleAuth'
import { Calculator } from './components/Calculator'
import { SettingsDrawer } from './components/SettingsDrawer'
import { Sidebar } from './components/Sidebar'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider, useUser } from './context/UserContext'
import { Bookmarks } from './pages/Bookmarks'
import { Dashboard } from './pages/Dashboard'
import { Files } from './pages/Files'
import { FocusForest } from './pages/FocusForest'
import { Notes } from './pages/Notes'
import { Skills } from './pages/Skills'

function Toast() {
  const { toast } = useUser()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl border border-app bg-card px-6 py-3 text-sm font-medium text-app shadow-xl"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AnalyticsBanner() {
  const { analyticsBanner } = useUser()
  if (!analyticsBanner) return null
  return (
    <div className="fixed top-0 left-60 right-0 z-20 bg-[var(--accent)]/20 py-1.5 text-center text-xs text-app">
      Analytics enabled to improve your experience
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/files" element={<Files />} />
          <Route path="/forest" element={<FocusForest />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/skills" element={<Skills />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen bg-app transition-colors duration-300">
      <Sidebar />
      <AnalyticsBanner />
      <main className="ml-60 min-h-screen p-6 pt-8 transition-colors duration-300">
        <AppRoutes />
      </main>
      <SettingsDrawer />
      <Calculator />
      <Toast />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('studyhub_theme')
    if (saved === 'light') document.documentElement.classList.add('light-mode')
    // Logged-in session is restored automatically in UserProvider via loadUser()
  }, [])

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

  const app = (
    <ThemeProvider>
      <UserProvider>
        <AppShell />
      </UserProvider>
    </ThemeProvider>
  )

  if (isGoogleClientConfigured()) {
    return <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
  }

  return app
}
