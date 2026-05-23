import { File, Trash2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Header } from '../components/Header'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, type StoredFile } from '../types'

const TYPE_FILTERS = ['All', 'image', 'pdf', 'text', 'other']

function fileCategory(type: string) {
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf') return 'pdf'
  if (type.startsWith('text/')) return 'text'
  return 'other'
}

export function Files() {
  const [files, setFiles] = useLocalStorage<StoredFile[]>(STORAGE_KEYS.files, [])
  const [filter, setFilter] = useState('All')

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const newFiles: StoredFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      date: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }))
    setFiles((prev) => [...newFiles, ...prev])
  }, [setFiles])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const filtered =
    filter === 'All' ? files : files.filter((f) => fileCategory(f.type) === filter)

  const formatSize = (n: number) => {
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <Header />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-app bg-card/50 py-16 transition hover:border-[var(--accent)]"
      >
        <Upload size={40} className="mb-3 text-[var(--accent)]" />
        <p className="text-app font-medium">Drag & drop files here</p>
        <p className="mt-1 text-sm text-muted">or click to browse</p>
        <input
          type="file"
          multiple
          className="mt-4 text-sm"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === t ? 'btn-accent' : 'border border-app text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((f) => (
          <div key={f.id} className="card-glow rounded-2xl border border-app bg-card p-4">
            {f.type.startsWith('image/') ? (
              <img src={f.url} alt={f.name} className="mb-3 h-24 w-full rounded-lg object-cover" />
            ) : (
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-white/5">
                <File size={32} className="text-muted" />
              </div>
            )}
            <p className="truncate text-sm font-medium text-app">{f.name}</p>
            <p className="text-xs text-muted">{formatSize(f.size)}</p>
            <p className="text-xs text-muted">{new Date(f.date).toLocaleDateString()}</p>
            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
              className="mt-2 text-muted hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
