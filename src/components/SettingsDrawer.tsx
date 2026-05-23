import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { useThemeContext } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { STORAGE_KEYS } from '../types'
import { AccountSection } from './AccountSection'
import { WeatherIcon } from './WeatherIcon'

const ACCENTS = ['#4FACFE', '#A855F7', '#F472B6', '#22D3EE', '#FBBF24']

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-app">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-app"
      >
        {title}
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SettingsDrawer() {
  const {
    settingsOpen,
    setSettingsOpen,
    settings,
    setSettings,
    weather,
    weatherLoading,
    weatherError,
    refreshWeather,
  } = useUser()
  const { theme, setTheme } = useThemeContext()

  const applyCity = (city: string) => {
    const trimmed = city.trim()
    setSettings({
      ...settings,
      cityOverride: trimmed,
      locationEnabled: trimmed ? true : settings.locationEnabled,
    })
    if (trimmed) {
      refreshWeather()
    }
  }

  const exportData = () => {
    const keys = Object.values(STORAGE_KEYS)
    const data: Record<string, unknown> = {}
    keys.forEach((k) => {
      const v = localStorage.getItem(k)
      if (v) data[k] = JSON.parse(v)
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'studyhub-data.json'
    a.click()
  }

  const clearData = () => {
    if (!confirm('Clear all study data? This cannot be undone.')) return
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setSettingsOpen(false)}
          />
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col overflow-y-auto border-l border-app bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-app p-5">
              <h2 className="font-heading text-xl font-bold text-app">Settings</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} className="text-muted hover:text-app">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 px-5">
              <Accordion title="① Account" defaultOpen>
                <AccountSection />
              </Accordion>

              <Accordion title="② Appearance">
                <p className="mb-2 text-sm text-muted">Theme</p>
                <div className="mb-4 flex gap-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`flex-1 rounded-lg py-2 text-sm capitalize ${
                        theme === t ? 'btn-accent' : 'border border-app text-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-sm text-muted">Accent color</p>
                <div className="mb-4 flex gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSettings({ ...settings, accentColor: c })}
                      className={`h-8 w-8 rounded-full ${settings.accentColor === c ? 'ring-2 ring-white' : ''}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <p className="mb-2 text-sm text-muted">Font size</p>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-1 text-sm capitalize text-app">
                      <input
                        type="radio"
                        name="fontSize"
                        checked={settings.fontSize === s}
                        onChange={() => setSettings({ ...settings, fontSize: s })}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </Accordion>

              <Accordion title="③ Location & Weather">
                <label className="mb-3 flex items-center justify-between text-sm text-app">
                  Enable Location
                  <input
                    type="checkbox"
                    checked={settings.locationEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked
                      setSettings({ ...settings, locationEnabled: enabled })
                      if (enabled) setTimeout(refreshWeather, 0)
                    }}
                    className="accent-[var(--accent)]"
                  />
                </label>
                <label className="mb-1 block text-sm text-muted">Your city</label>
                <input
                  value={settings.cityOverride}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cityOverride: e.target.value,
                      locationEnabled: e.target.value.trim() ? true : settings.locationEnabled,
                    })
                  }
                  onBlur={(e) => applyCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      applyCity((e.target as HTMLInputElement).value)
                    }
                  }}
                  placeholder="e.g. Lucknow, London, Tokyo"
                  className="w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app outline-none focus:border-[var(--accent)]"
                />
                <p className="mt-1 text-xs text-muted">
                  Weather updates as you type. Press Enter to refresh immediately.
                </p>
                {settings.locationEnabled && (
                  <div className="mt-3 rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2.5">
                    {weatherLoading && (
                      <div className="h-5 w-32 rounded shimmer" aria-label="Loading weather" />
                    )}
                    {!weatherLoading && weather && (
                      <p className="flex flex-wrap items-center gap-2 text-sm text-app">
                        <WeatherIcon
                          emoji={weather.icon}
                          iconUrl={weather.iconUrl}
                          label={weather.label}
                          condition={weather.condition}
                          size="sm"
                        />
                        <span className="font-medium">{weather.temp}°C</span>
                        <span className="text-muted">{weather.city}</span>
                        <span className="capitalize text-muted">· {weather.label}</span>
                        {weather.description && (
                          <span className="capitalize text-muted">({weather.description})</span>
                        )}
                      </p>
                    )}
                    {!weatherLoading && !weather && weatherError && (
                      <p className="text-xs text-amber-400">{weatherError}</p>
                    )}
                    {!weatherLoading && !weather && !weatherError && !settings.cityOverride.trim() && (
                      <p className="text-xs text-muted">Enter a city or allow browser location.</p>
                    )}
                  </div>
                )}
              </Accordion>

              <Accordion title="④ Notifications">
                <label className="mb-3 flex items-center justify-between text-sm text-app">
                  Study reminders
                  <input
                    type="checkbox"
                    checked={settings.studyReminders}
                    onChange={(e) => {
                      setSettings({ ...settings, studyReminders: e.target.checked })
                      if (e.target.checked) console.log('Study reminders enabled')
                    }}
                  />
                </label>
                <label className="mb-3 flex items-center justify-between text-sm text-app">
                  Break reminders
                  <input
                    type="checkbox"
                    checked={settings.breakReminders}
                    onChange={(e) => setSettings({ ...settings, breakReminders: e.target.checked })}
                  />
                </label>
                <select
                  value={settings.reminderInterval}
                  onChange={(e) => setSettings({ ...settings, reminderInterval: e.target.value })}
                  className="w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app"
                >
                  <option value="30">Every 30 min</option>
                  <option value="60">Every 1 hr</option>
                  <option value="120">Every 2 hrs</option>
                </select>
              </Accordion>

              <Accordion title="⑤ Data & Privacy">
                <label className="mb-3 flex items-center justify-between text-sm text-app">
                  Data Collection Mode
                  <input
                    type="checkbox"
                    checked={settings.dataCollection}
                    onChange={(e) => setSettings({ ...settings, dataCollection: e.target.checked })}
                  />
                </label>
                <button
                  type="button"
                  onClick={clearData}
                  className="mb-2 w-full rounded-lg border border-red-500/40 py-2 text-sm text-red-400"
                >
                  Clear all study data
                </button>
                <button
                  type="button"
                  onClick={exportData}
                  className="w-full rounded-lg border border-app py-2 text-sm text-app hover:bg-white/5"
                >
                  Export my data
                </button>
              </Accordion>

              <Accordion title="⑥ About">
                <p className="text-sm text-muted">StudyHub v1.0.0</p>
                <p className="mt-2 text-sm text-muted">Built for students who stay focused.</p>
                <a href="https://github.com" className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline">
                  GitHub
                </a>
              </Accordion>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
