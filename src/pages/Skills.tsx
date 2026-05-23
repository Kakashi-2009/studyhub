import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Header } from '../components/Header'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, type Skill } from '../types'

const COLORS = ['#4FACFE', '#A855F7', '#F472B6', '#22D3EE', '#FBBF24']

export function Skills() {
  const [skills, setSkills] = useLocalStorage<Skill[]>(STORAGE_KEYS.skills, [])
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const add = () => {
    if (!name.trim()) return
    setSkills((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), progress: 0, color, notes: '' },
    ])
    setName('')
    setModal(false)
  }

  const update = (id: string, patch: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  return (
    <div>
      <Header />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-app">Skills</h2>
        <button type="button" onClick={() => setModal(true)} className="btn-accent flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <div key={s.id} className="card-glow rounded-2xl border border-app bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-app">{s.name}</h3>
              <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x.id !== s.id))} className="text-muted hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${s.progress}%`, background: s.color }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={s.progress}
              onChange={(e) => update(s.id, { progress: Number(e.target.value) })}
              className="mb-3 w-full accent-[var(--accent)]"
            />
            <p className="mb-2 text-right text-xs text-muted">{s.progress}%</p>
            <textarea
              value={s.notes}
              onChange={(e) => update(s.id, { notes: e.target.value })}
              placeholder="Notes..."
              rows={3}
              className="w-full rounded-lg border border-app bg-[var(--bg-primary)] p-2 text-sm text-app outline-none"
            />
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-app bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading mb-4 text-lg font-semibold">Add Skill</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skill name"
              className="mb-3 w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app"
            />
            <div className="mb-4 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <button type="button" onClick={add} className="btn-accent w-full rounded-xl py-2 text-sm font-medium">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
