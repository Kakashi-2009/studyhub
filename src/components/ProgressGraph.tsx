import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useUser } from '../context/UserContext'
import type { DayData, ProgressRange } from '../types'

const COLORS = { theory: '#4FACFE', practice: '#A855F7', lexicon: '#F472B6' }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const practice = payload.find((p) => p.name === 'practice')?.value ?? 0
  const tip = practice < 50 ? '+12 More practice' : practice < 80 ? 'Great momentum!' : 'Outstanding focus!'
  return (
    <div className="rounded-xl border border-app bg-[#1a1d2e] p-3 shadow-xl">
      <p className="mb-2 font-medium text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm capitalize text-muted">
          {p.name}: <span className="text-white">{p.value}%</span>
        </p>
      ))}
      <p className="mt-2 text-xs text-[#22D3EE]">{tip}</p>
    </div>
  )
}

function ChartBody({ data, height }: { data: DayData[]; height: number }) {
  return (
  <div>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {(['theory', 'practice', 'lexicon'] as const).map((key) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[key]} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS[key]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="theory" stroke={COLORS.theory} fill="url(#grad-theory)" strokeWidth={2} />
        <Area type="monotone" dataKey="practice" stroke={COLORS.practice} fill="url(#grad-practice)" strokeWidth={2} />
        <Area type="monotone" dataKey="lexicon" stroke={COLORS.lexicon} fill="url(#grad-lexicon)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
    <div className="mt-4 flex justify-between gap-1 px-2">
      {data.map((d) => {
        const avg = Math.round((d.theory + d.practice + d.lexicon) / 3)
        return (
          <div key={d.day} className="flex-1 px-0.5">
            <div
              className="h-1.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, #22c55e, #14b8a6, #3b82f6)`,
                width: `${avg}%`,
                margin: '0 auto',
                maxWidth: '100%',
              }}
              title={`${avg}%`}
            />
          </div>
        )
      })}
    </div>
  </div>
  )
}

export function ProgressGraph() {
  const { progress } = useUser()
  const [range, setRange] = useState<ProgressRange>('weekly')
  const [expanded, setExpanded] = useState(false)

  const data = useMemo(() => {
    if (range === 'weekly') return progress
    if (range === 'daily') {
      const today = progress[new Date().getDay()] ?? progress[0]
      return [{ ...today, day: 'Today' }]
    }
    const months = ['W1', 'W2', 'W3', 'W4']
    return months.map((day, i) => ({
      day,
      theory: Math.min(100, progress[i % 7].theory + i * 5),
      practice: Math.min(100, progress[(i + 1) % 7].practice + i * 3),
      lexicon: Math.min(100, progress[(i + 2) % 7].lexicon + i * 2),
    }))
  }, [progress, range])

  return (
    <>
      <div className="card-glow rounded-2xl border border-app bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-app">Progress Graph</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-3 text-xs">
              {(['Theory', 'Practice', 'Lexicon'] as const).map((label, i) => (
                <span key={label} className="flex items-center gap-1.5 text-muted">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: Object.values(COLORS)[i] }}
                  />
                  {label}
                </span>
              ))}
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as ProgressRange)}
              className="rounded-lg border border-app bg-[var(--bg-primary)] px-2 py-1 text-sm text-app"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-app"
              aria-label="Expand graph"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
        <ChartBody data={data} height={260} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl rounded-2xl border border-app bg-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute right-4 top-4 text-muted hover:text-app"
              >
                <X size={24} />
              </button>
              <h2 className="font-heading mb-4 text-xl font-semibold">Progress Graph</h2>
              <ChartBody data={data} height={400} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
