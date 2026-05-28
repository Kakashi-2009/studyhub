import { Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from '../components/Header'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUser } from '../context/UserContext'
import { STORAGE_KEYS, type Note } from '../types'

export function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEYS.notes, [])
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const { incrementTheory } = useUser()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [noteContent, setNoteContent] = useState('')

  const active = notes.find((n) => n.id === activeId)

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '',
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [note, ...prev])
    setActiveId(note.id)
  }

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
      )
    },
    [setNotes]
  )

  const debouncedSave = useCallback(
    (id: string, content: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        updateNote(id, { content })
      }, 2000)
    },
    [updateNote]
  )

  useEffect(() => {
    if (editorRef.current && active) {
      if (editorRef.current.innerHTML !== active.content) {
        editorRef.current.innerHTML = active.content
      }
      setNoteContent(active.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    }
  }, [activeId])

  useEffect(() => {
    if (!activeId) return
    const timer = setTimeout(() => {
      if (noteContent.trim().length > 50) {
        incrementTheory(5)
      }
    }, 60000)
    return () => clearTimeout(timer)
  }, [activeId, incrementTheory, noteContent])

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    if (activeId) debouncedSave(activeId, editorRef.current?.innerHTML ?? '')
  }

  const snippet = (html: string) => {
    const text = html.replace(/<[^>]+>/g, '').trim()
    return text.slice(0, 60) || 'Empty note'
  }

  return (
    <div>
      <Header />
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-xl border border-app bg-card py-2.5 pl-10 pr-4 text-sm text-app outline-none"
          />
        </div>
        <button type="button" onClick={createNote} className="btn-accent flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={18} />
          New Note
        </button>
      </div>

      <div className="grid min-h-[500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="overflow-y-auto rounded-2xl border border-app bg-card p-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActiveId(n.id)}
              className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                activeId === n.id ? 'bg-[var(--accent)]/20' : 'hover:bg-white/5'
              }`}
            >
              <p className="font-medium text-app">{n.title}</p>
              <p className="mt-1 text-xs text-muted">{snippet(n.content)}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-4 text-sm text-muted">No notes yet</p>}
        </div>

        <div className="flex flex-col rounded-2xl border border-app bg-card">
          {active ? (
            <>
              <input
                value={active.title}
                onChange={(e) => updateNote(active.id, { title: e.target.value })}
                className="border-b border-app bg-transparent px-4 py-3 font-heading text-lg font-semibold text-app outline-none"
              />
              <div className="flex gap-1 border-b border-app px-2 py-2">
                {[
                  { cmd: 'bold', label: 'B' },
                  { cmd: 'italic', label: 'I' },
                  { cmd: 'underline', label: 'U' },
                ].map(({ cmd, label }) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => execCmd(cmd)}
                    className="rounded px-3 py-1 text-sm font-bold text-muted hover:bg-white/10 hover:text-app"
                  >
                    {label}
                  </button>
                ))}
                <button type="button" onClick={() => execCmd('formatBlock', 'pre')} className="rounded px-3 py-1 text-xs text-muted hover:bg-white/10">
                  code
                </button>
                <button type="button" onClick={() => execCmd('formatBlock', 'h2')} className="rounded px-3 py-1 text-xs text-muted hover:bg-white/10">
                  H
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 overflow-y-auto p-4 text-app outline-none"
                onInput={() => {
                  const html = editorRef.current?.innerHTML ?? ''
                  setNoteContent(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
                  if (activeId) debouncedSave(activeId, html)
                }}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted">Select or create a note</div>
          )}
        </div>
      </div>
    </div>
  )
}
