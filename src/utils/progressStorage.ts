export interface DayProgress {
  theory: number
  practice: number
  lexicon: number
}

export interface ProgressData {
  [date: string]: DayProgress
}

const STORAGE_KEY = 'studyhub_progress'

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getProgressData(): ProgressData {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

export function updateTodayProgress(
  field: 'theory' | 'practice' | 'lexicon',
  amount: number
): void {
  const data = getProgressData()
  const today = getTodayKey()
  if (!data[today]) {
    data[today] = { theory: 0, practice: 0, lexicon: 0 }
  }
  data[today][field] = Math.min(100, data[today][field] + amount)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getLast7DaysProgress() {
  const data = getProgressData()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({
      day: dayName,
      theory: data[key]?.theory || 0,
      practice: data[key]?.practice || 0,
      lexicon: data[key]?.lexicon || 0,
    })
  }
  return days
}