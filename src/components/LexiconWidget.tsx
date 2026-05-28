import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '../context/UserContext'

export function LexiconWidget() {
  const { incrementLexicon } = useUser()
  const [word, setWord] = useState('')

  const addWord = () => {
    if (!word.trim()) return
    incrementLexicon(10)
    setWord('')
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-app bg-card/50 px-3 py-2">
      <BookOpen size={16} className="text-[#F472B6]" />
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addWord()}
        placeholder="Log a new word..."
        className="flex-1 bg-transparent text-sm text-app outline-none"
      />
      <button type="button" onClick={addWord} className="text-xs font-medium text-[#F472B6] hover:underline">
        + Lexicon
      </button>
    </div>
  )
}
