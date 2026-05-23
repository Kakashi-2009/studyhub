import { motion } from 'framer-motion'
import { Pencil, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_QUOTES, STORAGE_KEYS, type QuoteData } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'

export function QuoteCard() {
  const [quote, setQuote] = useLocalStorage<QuoteData & { index?: number }>(STORAGE_KEYS.quote, {
    ...DEFAULT_QUOTES[0],
    index: 0,
  })
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(quote.text)
  const [author, setAuthor] = useState(quote.author)

  const shuffle = () => {
    const next = ((quote.index ?? 0) + 1) % DEFAULT_QUOTES.length
    setQuote({ ...DEFAULT_QUOTES[next], index: next })
    setText(DEFAULT_QUOTES[next].text)
    setAuthor(DEFAULT_QUOTES[next].author)
  }

  const save = () => {
    setQuote({ text, author, index: quote.index })
    setEditing(false)
  }

  return (
    <div className="card-glow relative flex h-full min-h-[280px] flex-col rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 p-6 text-white shadow-xl">
      <span className="text-5xl opacity-40">❝</span>
      {!editing ? (
        <motion.div
          key="display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col justify-center"
        >
          <p className="text-lg leading-relaxed text-lavender-100">{quote.text}</p>
          <p className="mt-4 text-sm text-violet-200">– {quote.author}</p>
        </motion.div>
      ) : (
        <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="flex-1 resize-none rounded-lg bg-white/10 p-3 text-sm outline-none placeholder:text-white/50"
            placeholder="Quote text"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm outline-none"
            placeholder="Author"
          />
          <button
            type="button"
            onClick={save}
            className="self-start rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
          >
            Save
          </button>
        </motion.div>
      )}
      <button
        type="button"
        onClick={() => {
          setText(quote.text)
          setAuthor(quote.author)
          setEditing(!editing)
        }}
        className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={shuffle}
        className="absolute bottom-4 right-4 rounded-lg p-2 hover:bg-white/10"
        aria-label="Shuffle quote"
      >
        <RefreshCw size={18} />
      </button>
    </div>
  )
}
