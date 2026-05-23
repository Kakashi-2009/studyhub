import { Settings } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { getTimeGreeting } from '../utils/timeGreeting'
import { WeatherWidget } from './WeatherWidget'

export function Header() {
  const { user, setSettingsOpen } = useUser()
  const { greeting, emoji } = getTimeGreeting()

  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-wrap items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-app md:text-3xl">
            {greeting}, {user.name}! {emoji}
          </h1>
          <p className="mt-1 text-muted italic">Stay focused and get things done</p>
        </div>
        <WeatherWidget />
      </div>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-app bg-card px-4 py-2.5 text-sm font-medium text-app transition hover:border-[var(--accent)] card-glow"
      >
        <Settings size={18} />
        Settings
      </button>
    </header>
  )
}
