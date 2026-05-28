import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useUser } from '../context/UserContext'
import {
  addCoins,
  addTree,
  getCoins,
  getForest,
  getForestStreak,
  saveForestStreak,
  type Tree,
} from '../utils/forestStorage'

type TreeType = Tree['type']
type SessionTag = 'Study' | 'Reading' | 'Practice' | 'Other'
type ViewState = 'idle' | 'running' | 'withered' | 'complete'

const TREE_OPTIONS: { type: TreeType; label: string; emoji: string; color: string }[] = [
  { type: 'pine', label: 'Pine Tree', emoji: '🌲', color: '#166534' },
  { type: 'cherry', label: 'Cherry Blossom', emoji: '🌸', color: '#F472B6' },
  { type: 'palm', label: 'Palm Tree', emoji: '🌴', color: '#22C55E' },
  { type: 'maple', label: 'Maple Tree', emoji: '🍁', color: '#FB7185' },
  { type: 'bamboo', label: 'Bamboo', emoji: '🎋', color: '#84CC16' },
]

const DURATION_OPTIONS = [25, 45, 60]

const dayKey = (value: Date) => value.toISOString().slice(0, 10)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const getCoinReward = (minutes: number) => {
  if (minutes === 25) return 10
  if (minutes === 45) return 20
  if (minutes === 60) return 30
  return Math.max(5, Math.round(minutes * 0.4))
}

function TreeArt({
  type,
  growth,
  withered,
}: {
  type: TreeType
  growth: number
  withered?: boolean
}) {
  const scale = Math.max(0.3, 0.4 + growth * 0.7)
  const stage = withered ? 5 : growth <= 0.02 ? 0 : growth < 0.25 ? 1 : growth < 0.5 ? 2 : growth < 0.75 ? 3 : 4
  const fill = withered ? '#6B7280' : TREE_OPTIONS.find((item) => item.type === type)?.color ?? '#22C55E'

  return (
    <motion.div
      animate={{
        scale,
        rotate: withered ? [0, -2, 2, 0] : type === 'palm' ? [0, 2, -2, 0] : 0,
      }}
      transition={{ duration: withered ? 0.8 : 0.5, repeat: withered || type === 'palm' ? Infinity : 0 }}
      className="relative"
    >
      <svg width="220" height="220" viewBox="0 0 220 220" aria-label="Growing tree">
        <ellipse cx="110" cy="195" rx="58" ry="14" fill="#3A2A1B" opacity="0.5" />

        {stage === 0 && <circle cx="110" cy="186" r="8" fill="#7C3F00" />}

        {type === 'pine' && (
          <>
            <rect x="102" y="138" width="16" height="52" rx="4" fill={withered ? '#7C7C7C' : '#7C3F00'} />
            <polygon points="110,56 68,128 152,128" fill={fill} />
            <polygon points="110,78 74,144 146,144" fill={fill} opacity="0.9" />
            <polygon points="110,100 82,156 138,156" fill={fill} opacity="0.85" />
          </>
        )}

        {type === 'cherry' && (
          <>
            <rect x="102" y="132" width="16" height="58" rx="6" fill={withered ? '#7C7C7C' : '#7C3F00'} />
            <circle cx="110" cy="92" r="42" fill={fill} opacity="0.95" />
            <circle cx="80" cy="103" r="24" fill={fill} opacity="0.8" />
            <circle cx="138" cy="103" r="24" fill={fill} opacity="0.8" />
            {!withered && (
              <>
                <circle cx="74" cy="76" r="3" fill="#FBCFE8" className="ff-float" />
                <circle cx="147" cy="85" r="3" fill="#FBCFE8" className="ff-float delay-1" />
                <circle cx="126" cy="62" r="2.5" fill="#FBCFE8" className="ff-float delay-2" />
              </>
            )}
          </>
        )}

        {type === 'palm' && (
          <>
            <path d="M108 186 C98 140, 110 120, 104 90" stroke={withered ? '#7C7C7C' : '#8B5A2B'} strokeWidth="11" fill="none" strokeLinecap="round" />
            <ellipse cx="103" cy="86" rx="40" ry="11" fill={fill} transform="rotate(-20 103 86)" />
            <ellipse cx="103" cy="86" rx="40" ry="11" fill={fill} transform="rotate(20 103 86)" />
            <ellipse cx="103" cy="86" rx="34" ry="10" fill={fill} transform="rotate(65 103 86)" />
            <ellipse cx="103" cy="86" rx="34" ry="10" fill={fill} transform="rotate(-65 103 86)" />
          </>
        )}

        {type === 'maple' && (
          <>
            <rect x="103" y="130" width="14" height="60" rx="5" fill={withered ? '#7C7C7C' : '#7C3F00'} />
            <path
              d="M108 56 L124 82 L152 70 L142 98 L167 109 L139 118 L145 146 L120 129 L108 152 L95 129 L70 146 L77 118 L48 109 L74 98 L63 70 L92 82 Z"
              fill={fill}
              opacity="0.95"
            />
          </>
        )}

        {type === 'bamboo' && (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${88 + i * 18} 0)`}>
                <rect x="0" y="96" width="10" height="94" rx="3" fill={fill} />
                <line x1="0" y1="124" x2="10" y2="124" stroke="#65A30D" strokeWidth="2" />
                <line x1="0" y1="150" x2="10" y2="150" stroke="#65A30D" strokeWidth="2" />
                <ellipse cx="-6" cy="120" rx="8" ry="4" fill={fill} transform="rotate(-30 -6 120)" />
                <ellipse cx="16" cy="142" rx="8" ry="4" fill={fill} transform="rotate(30 16 142)" />
              </g>
            ))}
          </>
        )}

        {withered && (
          <path
            d="M110 137 L98 118 M110 137 L123 120 M110 120 L90 95 M110 120 L133 98"
            stroke="#A3A3A3"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.div>
  )
}

export function FocusForest() {
  const { incrementPractice, showToast } = useUser()
  const [forest, setForest] = useState<Tree[]>([])
  const [coins, setCoins] = useState(0)
  const [view, setView] = useState<ViewState>('idle')
  const [selectedTree, setSelectedTree] = useState<TreeType>('pine')
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [customDuration, setCustomDuration] = useState(25)
  const [tag, setTag] = useState<SessionTag>('Study')
  const [remaining, setRemaining] = useState(25 * 60)
  const [showGiveUpModal, setShowGiveUpModal] = useState(false)
  const [lastReward, setLastReward] = useState(0)

  const sessionMinutes = DURATION_OPTIONS.includes(selectedDuration) ? selectedDuration : customDuration
  const totalSeconds = sessionMinutes * 60
  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0

  useEffect(() => {
    setForest(getForest())
    setCoins(getCoins())
  }, [])

  useEffect(() => {
    if (view !== 'running') return
    if (remaining <= 0) return
    const timer = window.setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [view, remaining])

  useEffect(() => {
    if (view !== 'running' || remaining > 0) return
    const reward = getCoinReward(sessionMinutes)
    const practiceAmount =
      sessionMinutes === 25
        ? 10
        : sessionMinutes === 45
          ? 18
          : sessionMinutes === 60
            ? 25
            : Math.max(1, Math.floor(sessionMinutes / 2.5))
    const completedTree: Tree = {
      id: crypto.randomUUID(),
      type: selectedTree,
      duration: sessionMinutes,
      completedAt: new Date().toISOString(),
      tag,
      coins: reward,
      withered: false,
    }
    addTree(completedTree)
    addCoins(reward)
    incrementPractice(practiceAmount)
    showToast(`🎉 Tree planted! +${reward} coins earned!`)
    setForest(getForest())
    setCoins(getCoins())
    setLastReward(reward)

    const today = dayKey(new Date())
    const streak = getForestStreak()
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = dayKey(yesterdayDate)

    const current = streak.lastDate === today ? streak.current : streak.lastDate === yesterday ? streak.current + 1 : 1
    saveForestStreak({
      current,
      longest: Math.max(streak.longest, current),
      lastDate: today,
    })

    setView('complete')
    const completeTimeout = window.setTimeout(() => {
      setView('idle')
      setRemaining(totalSeconds)
    }, 3000)
    return () => window.clearTimeout(completeTimeout)
  }, [incrementPractice, remaining, selectedTree, sessionMinutes, showToast, tag, totalSeconds, view])

  const startSession = () => {
    const duration = selectedDuration === -1 ? customDuration : selectedDuration
    const safeDuration = Math.max(1, duration)
    setRemaining(safeDuration * 60)
    setView('running')
  }

  const confirmGiveUp = () => {
    setShowGiveUpModal(false)
    setView('withered')
    showToast('Session abandoned. Keep trying! 💪')
    const witherTimeout = window.setTimeout(() => {
      setView('idle')
      setRemaining(totalSeconds)
    }, 1800)
    return () => window.clearTimeout(witherTimeout)
  }

  const stats = useMemo(() => {
    const totalTrees = forest.length
    const totalMinutes = forest.reduce((sum, tree) => sum + tree.duration, 0)
    const today = dayKey(new Date())
    const todaysFocus = forest
      .filter((tree) => dayKey(new Date(tree.completedAt)) === today)
      .reduce((sum, tree) => sum + tree.duration, 0)

    const streakFromDates = (() => {
      if (!forest.length) return 0
      const uniqueDates = Array.from(new Set(forest.map((tree) => dayKey(new Date(tree.completedAt))))).sort()
      let longest = 1
      let current = 1
      for (let i = 1; i < uniqueDates.length; i += 1) {
        const prev = new Date(uniqueDates[i - 1])
        const cur = new Date(uniqueDates[i])
        const diff = Math.round((cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 1) current += 1
        else current = 1
        longest = Math.max(longest, current)
      }
      return longest
    })()

    const streakSaved = getForestStreak().longest
    const longestStreak = Math.max(streakSaved, streakFromDates)

    const weekDays = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date()
      day.setDate(day.getDate() - (6 - idx))
      const key = dayKey(day)
      const count = forest.filter((tree) => dayKey(new Date(tree.completedAt)) === key).length
      return { label: day.toLocaleDateString(undefined, { weekday: 'short' }), count }
    })

    return { totalTrees, totalMinutes, longestStreak, todaysFocus, weekDays }
  }, [forest])

  return (
    <section className="card-glow rounded-2xl border border-app bg-card p-5">
      <style>{`
        @keyframes ffFall {
          from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          to { transform: translateY(90px) rotate(150deg); opacity: 0; }
        }
        @keyframes ffFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .ff-leaf { animation: ffFall 1.6s linear infinite; }
        .ff-float { animation: ffFloat 2.4s ease-in-out infinite; transform-origin: center; }
        .delay-1 { animation-delay: 0.4s; }
        .delay-2 { animation-delay: 0.8s; }
      `}</style>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-app">Focus Forest</h2>
          <p className="text-sm text-muted">Plant trees by finishing deep focus sessions.</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--bg-primary)] px-4 py-2 text-sm text-yellow-400">
          🪙 {coins} coins
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {TREE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setSelectedTree(option.type)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selectedTree === option.type
                      ? 'border-[#22C55E] bg-[#22C55E]/10'
                      : 'border-app bg-[var(--bg-primary)] hover:border-[#4FACFE]'
                  }`}
                >
                  <p className="text-lg">{option.emoji}</p>
                  <p className="text-sm font-semibold text-app">{option.label}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="rounded-xl border border-app bg-[var(--bg-primary)] p-3 text-sm text-muted">
                Duration
                <select
                  value={selectedDuration}
                  onChange={(event) => setSelectedDuration(Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-app bg-card px-2 py-2 text-app"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} min
                    </option>
                  ))}
                  <option value={-1}>Custom</option>
                </select>
              </label>

              <label className="rounded-xl border border-app bg-[var(--bg-primary)] p-3 text-sm text-muted">
                Custom minutes
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customDuration}
                  onChange={(event) => setCustomDuration(Math.max(1, Number(event.target.value) || 25))}
                  className="mt-2 w-full rounded-lg border border-app bg-card px-2 py-2 text-app"
                />
              </label>

              <label className="rounded-xl border border-app bg-[var(--bg-primary)] p-3 text-sm text-muted">
                Session tag
                <select
                  value={tag}
                  onChange={(event) => setTag(event.target.value as SessionTag)}
                  className="mt-2 w-full rounded-lg border border-app bg-card px-2 py-2 text-app"
                >
                  {['Study', 'Reading', 'Practice', 'Other'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={startSession}
              className="mt-4 rounded-full bg-gradient-to-r from-[#22C55E] to-[#4FACFE] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Plant Focus Tree
            </button>
          </motion.div>
        )}

        {view === 'running' && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col items-center">
              <div className="relative mb-2 h-[260px] w-[260px]">
                <svg width="260" height="260" className="absolute left-0 top-0 -rotate-90">
                  <circle cx="130" cy="130" r="118" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                  <circle
                    cx="130"
                    cy="130"
                    r="118"
                    stroke="#22C55E"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 118}
                    strokeDashoffset={(2 * Math.PI * 118) * (1 - progress)}
                    className="transition-[stroke-dashoffset] duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <TreeArt type={selectedTree} growth={progress} />
                </div>
              </div>
              <p className="text-3xl font-bold text-app">{formatTime(remaining)}</p>
              <p className="mt-1 text-sm text-muted">
                Stage {Math.min(4, Math.floor(progress * 4) + 1)} growing • {sessionMinutes} min • {tag}
              </p>
              <button
                type="button"
                onClick={() => setShowGiveUpModal(true)}
                className="mt-4 rounded-full border border-red-500/70 bg-red-500/10 px-5 py-2 text-sm font-medium text-red-300"
              >
                Give Up
              </button>
            </div>
          </motion.div>
        )}

        {view === 'withered' && (
          <motion.div key="withered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col items-center">
              <TreeArt type={selectedTree} growth={1} withered />
              <p className="mt-2 text-xl font-semibold text-red-300">Tree Withered 🥀</p>
            </div>
          </motion.div>
        )}

        {view === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative flex flex-col items-center overflow-hidden rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 py-4">
              {[...Array.from({ length: 9 })].map((_, idx) => (
                <span
                  key={idx}
                  className="ff-leaf absolute text-sm"
                  style={{ left: `${12 + idx * 10}%`, top: -8, animationDelay: `${idx * 0.12}s` }}
                >
                  🍃
                </span>
              ))}
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1.08 }} transition={{ duration: 0.5 }}>
                <TreeArt type={selectedTree} growth={1} />
              </motion.div>
              <p className="text-xl font-bold text-app">Session Complete! 🎉</p>
              <p className="text-sm text-yellow-400">+{lastReward} coins earned 🪙</p>
              <p className="text-sm text-[#22C55E]">Added to your forest 🌲</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 rounded-xl border border-app bg-[var(--bg-primary)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold text-app">Your Forest</h3>
          <p className="text-sm text-muted">
            {stats.totalTrees} trees • {stats.totalMinutes} focus minutes
          </p>
        </div>
        {forest.length === 0 ? (
          <p className="rounded-xl border border-dashed border-app p-4 text-sm text-muted">
            Your forest is empty. Plant your first tree!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {forest.map((tree) => {
              const option = TREE_OPTIONS.find((item) => item.type === tree.type)
              return (
                <div
                  key={tree.id}
                  title={`${option?.label} • ${tree.duration} min • ${tree.tag} • ${new Date(tree.completedAt).toLocaleString()} • +${tree.coins} coins`}
                  className="rounded-xl border border-app bg-card p-3 text-center"
                >
                  <p className="text-2xl">{option?.emoji}</p>
                  <p className="mt-1 text-xs text-app">{tree.duration} min</p>
                  <p className="text-[11px] text-muted">{formatDate(tree.completedAt)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-app bg-[var(--bg-primary)] p-4">
        <h3 className="mb-3 font-heading text-lg font-semibold text-app">Stats</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-app bg-card p-3 text-sm">
            <p className="text-muted">Total trees planted</p>
            <p className="text-xl font-bold text-app">{stats.totalTrees}</p>
          </div>
          <div className="rounded-lg border border-app bg-card p-3 text-sm">
            <p className="text-muted">Total focus time</p>
            <p className="text-xl font-bold text-app">
              {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
            </p>
          </div>
          <div className="rounded-lg border border-app bg-card p-3 text-sm">
            <p className="text-muted">Longest streak</p>
            <p className="text-xl font-bold text-app">{stats.longestStreak} days</p>
          </div>
          <div className="rounded-lg border border-app bg-card p-3 text-sm">
            <p className="text-muted">Today's focus</p>
            <p className="text-xl font-bold text-app">{stats.todaysFocus} min</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-app bg-card p-3">
          <p className="mb-2 text-sm text-muted">Weekly trees planted</p>
          <div className="flex items-end gap-2">
            {stats.weekDays.map((day) => {
              const height = Math.max(10, day.count * 16)
              return (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-[#22C55E] to-[#4FACFE]"
                    style={{ height }}
                    title={`${day.label}: ${day.count} tree(s)`}
                  />
                  <span className="text-[11px] text-muted">{day.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGiveUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              className="w-full max-w-md rounded-2xl border border-app bg-card p-5"
            >
              <p className="text-lg font-semibold text-app">Your tree will wither if you give up! Are you sure?</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-app px-4 py-2 text-sm text-app"
                  onClick={() => setShowGiveUpModal(false)}
                >
                  Keep Going 💪
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-medium text-white"
                  onClick={confirmGiveUp}
                >
                  Give Up 🥀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
