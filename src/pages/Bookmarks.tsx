import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Header } from '../components/Header'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, type Bookmark } from '../types'

const TAGS = ['All', 'Study', 'Reference', 'Tools', 'Other']

export function Bookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(STORAGE_KEYS.bookmarks, [])
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('Study')

  const filtered =
    filter === 'All' ? bookmarks : bookmarks.filter((b) => b.tags.includes(filter))

  const add = () => {
    if (!title.trim() || !url.trim()) return
    setBookmarks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        url: url.startsWith('http') ? url : `https://${url}`,
        tags: [tags],
      },
    ])
    setTitle('')
    setUrl('')
    setModal(false)
  }

  const remove = (id: string) => setBookmarks((prev) => prev.filter((b) => b.id !== id))

  const favicon = (u: string) => {
    try {
      const host = new URL(u).hostname
      return `https://www.google.com/s2/favicons?domain=${host}&sz=32`
    } catch {
      return ''
    }
  }

  return (
    <div>
      <Header />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold text-app">Bookmarks</h2>
        <button type="button" onClick={() => setModal(true)} className="btn-accent flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={18} />
          Add Bookmark
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === t ? 'btn-accent' : 'border border-app text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <div key={b.id} className="card-glow rounded-2xl border border-app bg-card p-4">
            <div className="mb-3 flex items-start justify-between">
              <img src={favicon(b.url)} alt="" className="h-8 w-8 rounded" />
              <button type="button" onClick={() => remove(b.id)} className="text-muted hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="font-medium text-app">{b.title}</h3>
            <p className="mt-1 truncate text-xs text-muted">{b.url}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {b.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
            >
              Open <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-app bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading mb-4 text-lg font-semibold">Add Bookmark</h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mb-3 w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mb-3 w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app"
            />
            <select
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mb-4 w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app"
            >
              {TAGS.filter((t) => t !== 'All').map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button type="button" onClick={add} className="btn-accent w-full rounded-xl py-2 text-sm font-medium">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
