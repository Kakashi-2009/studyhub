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
  { type: 'pine', label: 'Pine Tree', emoji: '🌲', color: '#40916c' },
  { type: 'cherry', label: 'Cherry Blossom', emoji: '🌸', color: '#ff85a1' },
  { type: 'maple', label: 'Maple Tree', emoji: '🍁', color: '#ea580c' },
  { type: 'jacaranda', label: 'Jacaranda Tree', emoji: '💜', color: '#8b5cf6' },
  { type: 'palm', label: 'Palm Tree', emoji: '🌴', color: '#22c55e' },
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
  totalSeconds,
  secondsLeft,
  withered,
  stageOverride,
  variant = 'full',
}: {
  type: TreeType
  totalSeconds: number
  secondsLeft: number
  withered?: boolean
  stageOverride?: number
  variant?: 'full' | 'mini'
}) {
  const safeTotal = Math.max(1, totalSeconds)
  const elapsed = safeTotal - Math.max(0, secondsLeft)
  const computedStageIndex = Math.floor((elapsed / safeTotal) * 5)
  const rawStage = withered ? 5 : Math.min(computedStageIndex, 4)
  const stage = typeof stageOverride === 'number' ? stageOverride : rawStage

  const stageScales = [0.1, 0.3, 0.55, 0.75, 0.9, 1]
  const stageOpacity = [0.6, 0.8, 0.9, 0.95, 1, 1]
  const scale = stageScales[Math.max(0, Math.min(stage, 5))]
  const opacity = stageOpacity[Math.max(0, Math.min(stage, 5))]

  const isPalm = type === 'palm' && !withered && variant === 'full'
  const baseFilter =
    type === 'pine'
      ? 'drop-shadow(0 0 12px #52b78866)'
      : type === 'cherry'
        ? 'drop-shadow(0 0 15px #ff85a180)'
          : type === 'maple'
          ? 'drop-shadow(0 0 20px #ea580c50)'
          : type === 'jacaranda'
            ? 'drop-shadow(0 0 20px #8b5cf660)'
            : type === 'palm'
              ? 'drop-shadow(0 0 12px #22c55e40)'
            : withered
              ? 'drop-shadow(0 0 8px #37415180)'
              : 'drop-shadow(0 0 8px #4ade8050)'

  const celebration = variant === 'full' && !withered && stage === 5
  const sparkleColor =
    type === 'pine'
      ? '#52b788'
      : type === 'cherry'
        ? '#ff85a1'
        : type === 'maple'
          ? '#f97316'
          : type === 'jacaranda'
            ? '#a78bfa'
            : '#22c55e'

  return (
    <motion.div
      className="relative"
      animate={{
        scale,
        opacity,
        rotate: withered ? [0, -1.5, 1.5, 0] : isPalm ? [ -3, 3, -3 ] : 0,
      }}
      transition={{
        duration: 2,
        ease: [0.34, 1.56, 0.64, 1],
        repeat: isPalm ? Infinity : 0,
        repeatType: 'mirror',
      }}
      style={{ filter: celebration ? `${baseFilter} brightness(1.1)` : baseFilter }}
    >
      <svg width={variant === 'mini' ? 120 : 240} height={variant === 'mini' ? 120 : 240} viewBox="0 0 240 240" aria-label="Tree">
        <ellipse cx="120" cy="210" rx="64" ry="12" fill={type === 'cherry' ? '#ff85a133' : '#00000020'} />

        {stage === 0 && !withered && (
          <>
            <circle cx="110" cy="186" r="6" fill="#7C3F00" />
            <rect x="108" y="176" width="4" height="14" rx="2" fill="#15803d" />
          </>
        )}

        {type === 'pine' && stage > 0 && !withered && (
          <>
            <path d="M112 204 L112 142 C112 132 116 124 121 118 L128 204 Z" fill="#8b5e3c" />
            <path d="M108 204 L108 136 C108 126 104 118 98 112 L92 204 Z" fill="#6b4226" />
            <path d="M120 62 L92 90 L101 92 L80 116 L97 115 L72 140 L95 140 L64 166 L176 166 L145 140 L168 140 L143 115 L160 116 L139 92 L148 90 Z" fill="#1a3d2b" />
            <path d="M120 50 L96 78 L104 80 L86 102 L101 102 L80 124 L100 124 L75 144 L165 144 L140 124 L160 124 L139 102 L154 102 L136 80 L144 78 Z" fill="#2d6a4f" />
            <path d="M120 40 L100 64 L108 66 L92 86 L105 86 L88 104 L106 104 L84 120 L156 120 L134 104 L152 104 L135 86 L148 86 L132 66 L140 64 Z" fill="#40916c" />
            <path d="M120 30 L106 48 L113 50 L101 66 L112 66 L100 80 L112 80 L96 94 L144 94 L128 80 L140 80 L128 66 L139 66 L127 50 L134 48 Z" fill="#52b788" />
            {[0, 1, 2, 3].map((i) => <circle key={`snow-${i}`} cx={112 + i * 6} cy={38 + i * 6} r="1.8" fill="#ffffff" />)}
          </>
        )}

        {type === 'cherry' && stage > 0 && !withered && (
          <>
            <path
              d="M120 204 C112 162 112 142 116 124 C120 102 126 90 136 84"
              stroke="#4a2c2a"
              strokeWidth="13"
              fill="none"
              strokeLinecap="round"
            />
            {[
              'M122 150 C98 142 86 132 76 118',
              'M122 146 C140 138 154 128 168 114',
              'M124 132 C116 118 106 108 94 100',
              'M130 128 C144 118 156 108 168 96',
            ].map((d, i) => (
              <path key={i} d={d} stroke="#5c3a2a" strokeWidth="6" fill="none" strokeLinecap="round" />
            ))}
            {[...Array.from({ length: 18 })].map((_, i) => {
              const cx = 66 + ((i * 17) % 108)
              const cy = 56 + ((i * 13) % 86)
              const r = 16 + (i % 4) * 6
              const fill = i % 4 === 0 ? '#ffb7c5' : i % 4 === 1 ? '#ff85a1' : i % 4 === 2 ? '#ff4d6d' : '#ffd6e0'
              return <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity="0.88" />
            })}
            {[...Array.from({ length: 8 })].map((_, i) => {
              const cx = 84 + (i % 4) * 20
              const cy = 72 + Math.floor(i / 4) * 28
              return (
                <g key={i} transform={`translate(${cx} ${cy})`}>
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <ellipse key={deg} rx="3.1" ry="6.2" fill="#fff0f3" transform={`rotate(${deg}) translate(0 -6)`} />
                  ))}
                  <circle r="2.2" fill="#ffb7c5" />
                </g>
              )
            })}
            {variant === 'full' &&
              [0, 1, 2, 3, 4, 5].map((i) => (
                <ellipse
                  key={`petal-${i}`}
                  className={`ff-cherry-petal ff-delay-${i}`}
                  cx={74 + i * 18}
                  cy={66 + (i % 2) * 8}
                  rx="3"
                  ry="5"
                  fill="#ffb7c5"
                />
              ))}
          </>
        )}

        {type === 'maple' && stage > 0 && !withered && (
          <>
            <path
              d="M120 206 C118 168 114 146 116 132 C118 116 126 106 136 98"
              stroke="#7b2d00"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
            />
            {[
              'M120 162 C96 148 84 134 74 118',
              'M122 158 C146 142 164 128 178 108',
              'M124 146 C108 132 96 122 86 108',
              'M128 140 C146 126 160 112 172 98',
            ].map((d, i) => (
              <path key={i} d={d} stroke="#8b3a00" strokeWidth="8" fill="none" strokeLinecap="round" />
            ))}
            {[
              { d: 'M44 114 C64 72 176 72 196 114 C196 140 176 156 120 156 C64 156 44 140 44 114 Z', fill: '#b91c1c' },
              { d: 'M56 104 C82 80 162 80 184 106 C182 130 160 146 120 146 C82 146 58 132 56 104 Z', fill: '#c2410c' },
            ].map((shape, index) => (
              <path key={index} d={shape.d} fill={shape.fill} opacity={0.86} />
            ))}
            {[...Array.from({ length: 24 })].map((_, i) => {
              const cx = 56 + ((i * 15) % 128)
              const cy = 74 + ((i * 17) % 66)
              const rot = (i * 31) % 360
              const fill = ['#dc2626', '#ea580c', '#f97316', '#d97706', '#ca8a04'][i % 5]
              return (
                <path
                  key={i}
                  d="M0 -8 L-4 -2 L-8 -2 L-3 1 L-5 7 L0 3 L5 7 L3 1 L8 -2 L4 -2 Z"
                  fill={fill}
                  transform={`translate(${cx} ${cy}) rotate(${rot})`}
                />
              )
            })}
            {variant === 'full' &&
              [0, 1, 2, 3].map((i) => (
                <path
                  key={`fall-${i}`}
                  className={`ff-maple-leaf ff-delay-${i}`}
                  d="M0 -8 L-4 -2 L-8 -2 L-3 1 L-5 7 L0 3 L5 7 L3 1 L8 -2 L4 -2 Z"
                  fill="#f97316"
                  transform={`translate(${96 + i * 20} ${92 + i * 8})`}
                />
              ))}
          </>
        )}

        {type === 'jacaranda' && stage > 0 && !withered && (
          <>
            <ellipse cx="120" cy="210" rx="50" ry="11" fill="#16a34a" />
            <ellipse cx="120" cy="210" rx="38" ry="8" fill="#22c55e" opacity="0.8" />
            <path d="M120 204 C116 170 114 150 116 130 C118 114 126 104 134 94" stroke="#7c5c3e" strokeWidth="14" fill="none" strokeLinecap="round" />
            {[
              'M120 152 C96 136 84 122 74 106',
              'M122 148 C144 136 158 122 172 104',
              'M126 136 C110 122 98 112 88 98',
              'M130 132 C148 120 162 108 174 92',
            ].map((d, i) => (
              <path key={i} d={d} stroke="#8b6a4a" strokeWidth="7" fill="none" strokeLinecap="round" />
            ))}
            {[...Array.from({ length: 18 })].map((_, i) => {
              const cx = 62 + ((i * 19) % 116)
              const cy = 68 + ((i * 17) % 72)
              const rx = 14 + (i % 3) * 4
              const ry = 10 + (i % 2) * 4
              const fill = ['#7c3aed', '#8b5cf6', '#a78bfa', '#6d28d9'][i % 4]
              return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} opacity="0.88" />
            })}
            {[0, 1, 2, 3].map((i) => (
              <ellipse
                key={i}
                className="ff-jacaranda-leaf"
                cx={94 + i * 20}
                cy={124 - (i % 2) * 10}
                rx="10"
                ry="6"
                fill={i % 2 === 0 ? '#16a34a' : '#22c55e'}
              />
            ))}
            {variant === 'full' &&
              [...Array.from({ length: 8 })].map((_, i) => (
                <ellipse
                  key={i}
                  className={`ff-jacaranda-petal ff-delay-${i}`}
                  cx={72 + i * 15}
                  cy={74 + (i % 2) * 10}
                  rx="3"
                  ry="6"
                  fill={i % 2 === 0 ? '#a78bfa' : '#c4b5fd'}
                />
              ))}
          </>
        )}

        {type === 'palm' && stage > 0 && !withered && (
          <>
            <path d="M120 208 C112 170 114 144 122 122 C128 106 136 90 144 68" stroke="#8B4513" strokeWidth="12" fill="none" strokeLinecap="round" />
            {[...Array.from({ length: 7 })].map((_, i) => (
              <rect key={i} x={116} y={188 - i * 16} width="10" height="7" rx="2" fill={i % 2 === 0 ? '#8B4513' : '#A0522D'} />
            ))}
            <g className={isPalm ? 'ff-palm-sway' : ''} transform="translate(0,-10)">
              {[0, 45, 90, 135, 180, 225, 300].map((deg, i) => (
                <path
                  key={i}
                  d="M140 70 C154 54 172 52 188 56 C174 68 158 76 140 76 Z"
                  fill={['#15803d', '#16a34a', '#22c55e', '#4ade80'][i % 4]}
                  transform={`rotate(${deg} 140 70)`}
                />
              ))}
            </g>
            {[0, 1, 2].map((i) => <circle key={i} cx={132 + i * 7} cy={92 + (i % 2) * 4} r="5" fill="#3d1f0a" />)}
          </>
        )}

        {withered && (
          <>
            <path
              d="M112 190 C104 162, 106 150, 104 134 C102 120, 96 110, 92 104"
              stroke="#1f2937"
              strokeWidth="11"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M112 160 C120 150, 128 142, 134 134"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M106 148 C96 140, 90 132, 84 122"
              stroke="#374151"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {[0, 1, 2].map((i) => (
              <path
                key={`crack-${i}`}
                d={`M ${108 + i * 3} 190 C ${104 + i * 3} 180, ${110 + i * 3} 172, ${106 + i * 3} 162`}
                stroke="#111827"
                strokeWidth="2"
                fill="none"
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={`dead-leaf-${i}`}
                className="ff-wither-leaf"
                d={`
                  M ${96 + i * 10} 132
                  C ${94 + i * 10} 136, ${92 + i * 10} 140, ${96 + i * 10} 144
                  C ${100 + i * 10} 140, ${98 + i * 10} 136, ${96 + i * 10} 132
                `}
                fill="#6b7280"
              />
            ))}
          </>
        )}
      </svg>

      {celebration && (
        <>
          {[...Array(10)].map((_, index) => {
            const angle = (index / 10) * 2 * Math.PI
            const distance = 80
            const x = Math.cos(angle) * distance
            const y = Math.sin(angle) * distance
            return (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="ff-sparkle"
                style={{ transform: `translate(${x}px, ${y}px)`, color: sparkleColor }}
              >
                ✨
              </span>
            )
          })}
          {[...Array(12)].map((_, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`confetti-${index}`}
              className={`ff-confetti ff-delay-${index % 4}`}
            />
          ))}
        </>
      )}
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
        @keyframes ffCherryPetal {
          0% { transform: translate3d(0,-10px,0) rotate(0deg); opacity: 0.9; }
          100% { transform: translate3d(-20px,80px,0) rotate(120deg); opacity: 0; }
        }
        @keyframes ffPalmSway {
          0% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          100% { transform: rotate(-3deg); }
        }
        @keyframes ffMapleLeaf {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(80px) rotate(90deg); opacity: 0; }
        }
        @keyframes ffJacarandaRain {
          0% { transform: translate3d(0,-12px,0) rotate(0deg); opacity: 0.95; }
          100% { transform: translate3d(-16px,88px,0) rotate(120deg); opacity: 0; }
        }
        @keyframes ffCoinFloat {
          0% { transform: translateY(10px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(-36px); opacity: 0; }
        }
        @keyframes ffJacarandaRustle {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ffWitherShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        @keyframes ffSparkle {
          0% { opacity: 0; transform: scale(0.4); }
          20% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.4); }
        }
        @keyframes ffConfetti {
          0% { transform: translate3d(0,-20px,0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(0,90px,0) rotate(180deg); opacity: 0; }
        }
        .ff-leaf { animation: ffFall 1.6s linear infinite; }
        .ff-float { animation: ffFloat 2.4s ease-in-out infinite; transform-origin: center; }
        .delay-1 { animation-delay: 0.4s; }
        .delay-2 { animation-delay: 0.8s; }
        .ff-delay-0 { animation-delay: 0s; }
        .ff-delay-1 { animation-delay: 0.1s; }
        .ff-delay-2 { animation-delay: 0.2s; }
        .ff-delay-3 { animation-delay: 0.3s; }
        .ff-delay-4 { animation-delay: 0.4s; }
        .ff-delay-5 { animation-delay: 0.5s; }
        .ff-delay-6 { animation-delay: 0.6s; }
        .ff-delay-7 { animation-delay: 0.7s; }
        .ff-cherry-petal { animation: ffCherryPetal 5s linear infinite; }
        .ff-palm-sway { animation: ffPalmSway 3.2s ease-in-out infinite; transform-origin: 120px 76px; }
        .ff-maple-leaf { animation: ffMapleLeaf 5.4s linear infinite; }
        .ff-jacaranda-petal { animation: ffJacarandaRain 5s linear infinite; }
        .ff-jacaranda-leaf { animation: ffJacarandaRustle 3.2s ease-in-out infinite; transform-origin: center; }
        .ff-wither-leaf { animation: ffFall 3s linear infinite; }
        .ff-sparkle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: center;
          animation: ffSparkle 1.5s ease-out forwards;
          font-size: 14px;
        }
        .ff-confetti {
          position: absolute;
          left: 50%;
          top: 10%;
          width: 6px;
          height: 6px;
          background: #4f46e5;
          animation: ffConfetti 1.5s ease-out forwards;
        }
        .ff-confetti.ff-delay-1 { background: #22c55e; animation-delay: 0.1s; }
        .ff-confetti.ff-delay-2 { background: #f97316; animation-delay: 0.2s; }
        .ff-confetti.ff-delay-3 { background: #ec4899; animation-delay: 0.3s; }
        .ff-coin-float {
          animation: ffCoinFloat 1.4s ease-out forwards;
        }
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
                  className={`rounded-xl border px-3 py-3 text-left transition duration-200 hover:-translate-y-1 ${
                    selectedTree === option.type ? 'scale-105' : 'border-app'
                  }`}
                  style={{
                    borderColor: selectedTree === option.type ? option.color : undefined,
                    boxShadow: selectedTree === option.type ? `0 0 20px ${option.color}66` : undefined,
                    background:
                      option.type === 'pine'
                        ? 'linear-gradient(180deg, rgba(26,61,43,0.35), rgba(45,106,79,0.12))'
                        : option.type === 'cherry'
                          ? 'linear-gradient(180deg, rgba(255,183,197,0.30), rgba(255,77,109,0.10))'
                          : option.type === 'maple'
                            ? 'linear-gradient(180deg, rgba(234,88,12,0.30), rgba(202,138,4,0.10))'
                            : option.type === 'jacaranda'
                              ? 'linear-gradient(180deg, rgba(139,92,246,0.32), rgba(124,58,237,0.10))'
                              : 'linear-gradient(180deg, rgba(34,197,94,0.30), rgba(20,184,166,0.10))',
                  }}
                >
                  <div className="mb-1 flex justify-center">
                    <div className="h-20 w-20">
                      <TreeArt
                        type={option.type}
                        totalSeconds={1}
                        secondsLeft={0}
                        stageOverride={4}
                        variant="mini"
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-app text-center">{option.label}</p>
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
                  <TreeArt type={selectedTree} totalSeconds={totalSeconds} secondsLeft={remaining} />
                </div>
              </div>
              <p className="text-3xl font-bold text-app">{formatTime(remaining)}</p>
              <p className="mt-1 text-sm text-muted">
                {`Stage ${Math.min(
                  4,
                  Math.floor(((totalSeconds - remaining) / Math.max(1, totalSeconds)) * 5)
                ) + 1} growing • ${sessionMinutes} min • ${tag}`}
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
              <TreeArt type={selectedTree} totalSeconds={totalSeconds} secondsLeft={0} withered />
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
                <TreeArt type={selectedTree} totalSeconds={totalSeconds} secondsLeft={0} />
              </motion.div>
              <p className="text-xl font-bold text-app">Session Complete! 🎉</p>
              <p className="ff-coin-float text-sm text-yellow-400">+{lastReward} coins 🪙</p>
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
                  className={`rounded-xl border border-app p-3 text-center transition-transform duration-200 hover:-translate-y-1 ${
                    tree.type === 'pine'
                      ? 'bg-[#1a3d2b22] hover:shadow-[0_0_16px_rgba(82,183,136,0.45)]'
                      : tree.type === 'cherry'
                        ? 'bg-[#ff85a11f] hover:shadow-[0_0_16px_rgba(255,133,161,0.45)]'
                        : tree.type === 'maple'
                          ? 'bg-[#ea580c1f] hover:shadow-[0_0_16px_rgba(249,115,22,0.45)]'
                          : tree.type === 'jacaranda'
                            ? 'bg-[#8b5cf61f] hover:shadow-[0_0_16px_rgba(139,92,246,0.45)]'
                            : 'bg-[#22c55e1f] hover:shadow-[0_0_16px_rgba(34,197,94,0.45)]'
                  }`}
                >
                  <div className="mb-1 flex justify-center">
                    <div className="h-16 w-16">
                      <TreeArt
                        type={tree.type}
                        totalSeconds={1}
                        secondsLeft={0}
                        stageOverride={4}
                        variant="mini"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-app">{tree.duration} min</p>
                  <p className="text-[11px] text-muted">{tree.tag}</p>
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
