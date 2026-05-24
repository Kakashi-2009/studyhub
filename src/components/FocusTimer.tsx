import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useTimer } from '../hooks/useTimer'
import { playChime } from '../utils/sounds'

export function FocusTimer() {
  const { settings, setSettings, incrementPractice, showToast } = useUser()
  const focusSeconds = settings.timerFocus * 60
  const timer = useTimer(focusSeconds)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    timer.setDuration(focusSeconds)
  }, [focusSeconds])

  useEffect(() => {
    timer.setOnComplete(() => {
      playChime()
      showToast('🎉 Focus session complete! Take a break.')
      incrementPractice(5)
      timer.reset(focusSeconds)
    })
  }, [focusSeconds])

  const size = 200
  const stroke = 10
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - timer.progress)

  return (
    <div className="card-glow flex h-full flex-col items-center rounded-2xl border border-app bg-card p-5">
      <div className="mb-4 flex w-full items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-app">
          <Clock size={20} className="text-[var(--accent)]" />
          Focus Timer
        </h2>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-1.5 text-muted hover:text-app"
        >
          <Settings size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 w-full space-y-2 overflow-hidden rounded-xl border border-app bg-[var(--bg-primary)] p-3 text-sm"
          >
            <label className="flex items-center justify-between text-muted">
              Focus (min)
              <select
                value={settings.timerFocus}
                onChange={(e) => setSettings({ ...settings, timerFocus: Number(e.target.value) })}
                className="rounded border border-app bg-card px-2 py-1 text-app"
              >
                {[25, 45, 60].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between text-muted">
              Custom
              <input
                type="number"
                min={1}
                max={120}
                value={settings.timerFocus}
                onChange={(e) =>
                  setSettings({ ...settings, timerFocus: Math.max(1, Number(e.target.value) || 25) })
                }
                className="w-16 rounded border border-app bg-card px-2 py-1 text-app"
              />
            </label>
            <label className="flex items-center justify-between text-muted">
              Short break
              <input
                type="number"
                value={settings.timerShortBreak}
                onChange={(e) =>
                  setSettings({ ...settings, timerShortBreak: Number(e.target.value) || 5 })
                }
                className="w-16 rounded border border-app bg-card px-2 py-1 text-app"
              />
            </label>
            <label className="flex items-center justify-between text-muted">
              Long break
              <input
                type="number"
                value={settings.timerLongBreak}
                onChange={(e) =>
                  setSettings({ ...settings, timerLongBreak: Number(e.target.value) || 15 })
                }
                className="w-16 rounded border border-app bg-card px-2 py-1 text-app"
              />
            </label>
            <label className="flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
              />
              Auto-start breaks
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-app">
          {timer.formatTime()}
        </span>
        <motion.div
          className="absolute h-3 w-3 rounded-full bg-white shadow-lg"
          style={{
            left: size / 2 + r * Math.cos(timer.progress * 2 * Math.PI - Math.PI / 2) - 6,
            top: size / 2 + r * Math.sin(timer.progress * 2 * Math.PI - Math.PI / 2) - 6,
          }}
        />
      </div>

      <div className="mt-6 flex gap-3">
        {!timer.isRunning ? (
          <button
            type="button"
            onClick={timer.start}
            className="btn-accent rounded-full px-8 py-2.5 text-sm font-semibold shadow-lg"
          >
            Start Focus
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={timer.pause}
              className="rounded-full border border-app px-6 py-2.5 text-sm font-medium text-app hover:bg-white/5"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => timer.reset(focusSeconds)}
              className="rounded-full border border-app px-6 py-2.5 text-sm font-medium text-muted hover:text-app"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}
