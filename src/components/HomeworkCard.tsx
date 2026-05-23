import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, ClipboardList, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { STORAGE_KEYS, SUBJECT_COLORS, type HomeworkTask } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'

const SUBJECTS = ['Math', 'Science', 'History', 'English', 'Physics', 'Other']

function TaskName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el) setAnimate(el.scrollWidth > el.clientWidth)
  }, [name])

  return (
    <div className="marquee-wrap flex-1 min-w-0 max-w-[180px]">
      <span ref={ref} className={`marquee-text text-sm ${animate ? 'animate' : ''}`}>
        {name}
      </span>
    </div>
  )
}

export function HomeworkCard() {
  const [tasks, setTasks] = useLocalStorage<HomeworkTask[]>(STORAGE_KEYS.homework, [])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('Math')
  const inputRef = useRef<HTMLInputElement>(null)

  const active = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  const addTask = () => {
    if (!name.trim()) return
    const task: HomeworkTask = {
      id: crypto.randomUUID(),
      name: name.trim(),
      subject,
      color: SUBJECT_COLORS[subject] ?? '#94A3B8',
      completed: false,
      notes: '',
    }
    setTasks((prev) => [task, ...prev])
    setName('')
    setShowForm(false)
  }

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const updateNotes = (id: string, notes: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, notes } : t)))
  }

  useEffect(() => {
    if (showForm) inputRef.current?.focus()
  }, [showForm])

  return (
    <div className="card-glow flex h-full flex-col rounded-2xl border border-app bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-app">
          <ClipboardList size={20} className="text-[var(--accent)]" />
          Homework
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-[var(--accent)]"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="What do you need to do?"
              className="mb-2 w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app outline-none focus:border-[var(--accent)]"
            />
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    subject === s ? 'ring-2 ring-white/30' : 'opacity-70'
                  }`}
                  style={{ background: SUBJECT_COLORS[s], color: '#fff' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button type="button" onClick={addTask} className="btn-accent rounded-lg px-4 py-1.5 text-sm font-medium">
              Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="flex-1 space-y-1 overflow-y-auto">
        {active.map((task) => (
          <motion.li
            key={task.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-transparent hover:border-app"
          >
            <div className="flex items-center gap-2 px-2 py-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
                className="accent-[var(--accent)]"
              />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: task.color }} />
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              >
                <TaskName name={task.name} />
              </button>
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                className="text-muted"
              >
                {expandedId === task.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
            <AnimatePresence>
              {expandedId === task.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-3"
                >
                  <textarea
                    value={task.notes}
                    onChange={(e) => updateNotes(task.id, e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full rounded-lg border border-app bg-[var(--bg-primary)] p-2 text-sm text-app outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        ))}
      </ul>

      {completed.length > 0 && (
        <div className="mt-3 border-t border-app pt-2">
          <button
            type="button"
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex w-full items-center gap-2 text-sm text-muted"
          >
            <ChevronDown size={16} className={completedOpen ? '' : '-rotate-90'} />
            Completed ({completed.length})
          </button>
          <AnimatePresence>
            {completedOpen &&
              completed.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-2 py-2 opacity-60"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleComplete(task.id)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="line-through text-sm text-muted">{task.name}</span>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
