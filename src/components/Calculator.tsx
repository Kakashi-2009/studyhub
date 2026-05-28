import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { create, all } from 'mathjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '../context/UserContext'

const math = create(all)
math.import(
  {
    sind: (x: number) => Math.sin((x * Math.PI) / 180),
    cosd: (x: number) => Math.cos((x * Math.PI) / 180),
    tand: (x: number) => Math.tan((x * Math.PI) / 180),
    asind: (x: number) => (Math.asin(x) * 180) / Math.PI,
    acosd: (x: number) => (Math.acos(x) * 180) / Math.PI,
    atand: (x: number) => (Math.atan(x) * 180) / Math.PI,
  },
  { override: true }
)

type Tab = 'standard' | 'scientific'

type HistoryEntry = { expr: string; result: string }

function preprocess(expr: string, deg: boolean): string {
  const hasExplicitDegree = /(?:\d+(?:\.\d+)?|\.\d+)°/.test(expr)
  let e = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/√\(/g, 'sqrt(')
    .replace(/∛\(/g, 'cbrt(')
    .replace(/π/g, 'pi')
    .replace(/\^/g, '^')
    .replace(/%/g, '/100')
    .replace(/\|([^|]+)\|/g, 'abs($1)')
    .replace(/(\d+)!/g, 'factorial($1)')
    .replace(/sin⁻¹/g, 'asin')
    .replace(/cos⁻¹/g, 'acos')
    .replace(/tan⁻¹/g, 'atan')
    .replace(/sinh/g, 'sinh')
    .replace(/cosh/g, 'cosh')
    .replace(/tanh/g, 'tanh')
    .replace(/ln/g, 'log')
    .replace(/log\(/g, 'log10(')
    .replace(/eˣ/g, 'exp(')
    .replace(/x²/g, '^2')
    .replace(/x³/g, '^3')
    .replace(/1\/x/g, '1/(')
    .replace(/(\d+(?:\.\d+)?|\.\d+)°/g, '($1*pi/180)')
  if (deg && !hasExplicitDegree) {
    e = e
      .replace(/\bsin\(/g, 'sind(')
      .replace(/\bcos\(/g, 'cosd(')
      .replace(/\btan\(/g, 'tand(')
      .replace(/\basin\(/g, 'asind(')
      .replace(/\bacos\(/g, 'acosd(')
      .replace(/\batan\(/g, 'atand(')
  } else if (hasExplicitDegree) {
    e = e
      .replace(/\bsin\(/g, 'sin(')
      .replace(/\bcos\(/g, 'cos(')
      .replace(/\btan\(/g, 'tan(')
  }
  return e
}

export function Calculator() {
  const { calculatorOpen, setCalculatorOpen } = useUser()
  const [tab, setTab] = useState<Tab>('standard')
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [deg, setDeg] = useState(true)
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const evaluate = useCallback(
    (expr?: string) => {
      const raw = (expr ?? expression).trim()
      if (!raw) return
      try {
        const processed = preprocess(raw, deg)
        const val = math.evaluate(processed)
        const res = String(typeof val === 'object' && 'toString' in val ? val.toString() : val)
        setResult(res)
        setHistory((h) => [{ expr: raw, result: res }, ...h].slice(0, 10))
        setExpression(res)
      } catch {
        setResult('Error')
      }
    },
    [expression, deg]
  )

  const press = (key: string) => {
    if (key === 'C') {
      setExpression('')
      setResult('')
      return
    }
    if (key === '=') {
      evaluate()
      return
    }
    if (key === '±') {
      setExpression((e) => (e.startsWith('-') ? e.slice(1) : '-' + e))
      return
    }
    if (key === 'M+') {
      setMemory((m) => m + (Number(result) || 0))
      return
    }
    if (key === 'M−') {
      setMemory((m) => m - (Number(result) || 0))
      return
    }
    if (key === 'MR') {
      setExpression(String(memory))
      return
    }
    if (key === 'MC') {
      setMemory(0)
      return
    }
    if (key === 'EXP') {
      setExpression((e) => e + 'e')
      return
    }
    if (key === '°') {
      setExpression((e) => e + '°')
      return
    }
    setExpression((e) => e + key)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalculatorOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCalculatorOpen])

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      setPos({
        x: dragRef.current.origX + e.clientX - dragRef.current.startX,
        y: dragRef.current.origY + e.clientY - dragRef.current.startY,
      })
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [pos])

  const stdKeys = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ]

  const sciKeys = [
    ['sin', 'cos', 'tan', '°'],
    ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', '√('],
    ['∛(', 'x^', 'log(', 'ln('],
    ['eˣ', 'π', 'e', '('],
    ['x²', 'x³', '1/x', '|x|'],
    ['n!', 'sinh', 'cosh', 'tanh'],
    ['EXP', 'M+', 'M−', 'MR', 'MC'],
  ]

  return (
    <AnimatePresence>
      {calculatorOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed z-[60] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-app bg-card shadow-2xl"
          style={{
            left: `calc(50% + ${pos.x}px)`,
            top: `calc(50% + ${pos.y}px)`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={onMouseDown}
        >
          <div className="flex cursor-move items-center justify-between border-b border-app px-4 py-3">
            <div className="flex gap-2">
              {(['standard', 'scientific'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-3 py-1 text-xs capitalize ${
                    tab === t ? 'btn-accent' : 'text-muted hover:text-app'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setCalculatorOpen(false)} className="text-muted hover:text-app">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {tab === 'scientific' && (
              <button
                type="button"
                onClick={() => setDeg(!deg)}
                className="mb-2 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium"
              >
                {deg ? 'DEG' : 'RAD'}
              </button>
            )}
            <input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="mb-1 w-full bg-transparent text-right text-sm text-muted outline-none"
              placeholder="Expression"
            />
            <div className="mb-3 text-right text-3xl font-bold text-app">{result || '0'}</div>

            <div className={`grid gap-1.5 ${tab === 'scientific' ? 'max-h-48 overflow-y-auto' : ''}`}>
              {(tab === 'standard' ? stdKeys : [...sciKeys, ...stdKeys.slice(1)]).map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-1.5">
                  {row.map((key) => {
                    if (key === 'DEG') {
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDeg(!deg)}
                          className="rounded-lg bg-white/10 py-2 text-xs font-medium"
                        >
                          {deg ? 'DEG' : 'RAD'}
                        </button>
                      )
                    }
                    const wide = key === '0'
                    return (
                      <button
                        key={`${ri}-${key}`}
                        type="button"
                        onClick={() => press(key === 'n!' ? '!' : key)}
                        className={`rounded-lg py-2.5 text-sm font-medium transition hover:bg-white/10 ${
                          ['÷', '×', '−', '+', '='].includes(key)
                            ? 'bg-[var(--accent)]/30 text-white'
                            : 'bg-white/5 text-app'
                        } ${wide ? 'col-span-2' : ''}`}
                      >
                        {key}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="mt-3 max-h-24 overflow-y-auto border-t border-app pt-2">
              <p className="mb-1 text-xs text-muted">History</p>
              {history.length === 0 && <p className="text-xs text-muted">No calculations yet</p>}
              {history.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setExpression(h.expr)
                    setResult(h.result)
                  }}
                  className="block w-full rounded px-1 py-0.5 text-left text-xs text-muted hover:bg-white/5 hover:text-app"
                >
                  {h.expr} = {h.result}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
