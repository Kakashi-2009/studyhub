export type DayData = {
  day: string
  theory: number
  practice: number
  lexicon: number
}

export type HomeworkTask = {
  id: string
  name: string
  subject: string
  color: string
  completed: boolean
  notes: string
}

export type AuthProvider = 'google' | 'email'

export type UserProfile = {
  name: string
  email: string
  picture?: string
  provider?: AuthProvider
  loggedInAt?: string
}

export type AppSettings = {
  locationEnabled: boolean
  cityOverride: string
  studyReminders: boolean
  breakReminders: boolean
  reminderInterval: string
  dataCollection: boolean
  fontSize: 'small' | 'medium' | 'large'
  accentColor: string
  timerFocus: number
  timerShortBreak: number
  timerLongBreak: number
  autoStartBreaks: boolean
}

export type QuoteData = {
  text: string
  author: string
}

export type Bookmark = {
  id: string
  title: string
  url: string
  tags: string[]
}

export type StoredFile = {
  id: string
  name: string
  size: number
  type: string
  date: string
  url: string
}

export type Note = {
  id: string
  title: string
  content: string
  updatedAt: string
}

export type Skill = {
  id: string
  name: string
  progress: number
  color: string
  notes: string
}

export type ProgressRange = 'daily' | 'weekly' | 'monthly'

export const STORAGE_KEYS = {
  theme: 'studyhub_theme',
  user: 'studyhub_user',
  homework: 'studyhub_homework',
  notes: 'studyhub_notes',
  progress: 'studyhub_progress',
  settings: 'studyhub_settings',
  bookmarks: 'studyhub_bookmarks',
  skills: 'studyhub_skills',
  quote: 'studyhub_quote',
  files: 'studyhub_files',
} as const

export const SUBJECT_COLORS: Record<string, string> = {
  Math: '#4FACFE',
  Science: '#22D3EE',
  History: '#F472B6',
  English: '#A855F7',
  Physics: '#FBBF24',
  Other: '#94A3B8',
}

export const DEFAULT_QUOTES: QuoteData[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'Strive for progress, not perfection.', author: 'Unknown' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
]

export const DEFAULT_SETTINGS: AppSettings = {
  locationEnabled: false,
  cityOverride: '',
  studyReminders: false,
  breakReminders: false,
  reminderInterval: '30',
  dataCollection: false,
  fontSize: 'medium',
  accentColor: '#4FACFE',
  timerFocus: 25,
  timerShortBreak: 5,
  timerLongBreak: 15,
  autoStartBreaks: false,
}

export const DEFAULT_USER: UserProfile = {
  name: 'User',
  email: '',
}

export function getDefaultWeeklyProgress(): DayData[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({
    day,
    theory: Math.floor(Math.random() * 40) + 20,
    practice: Math.floor(Math.random() * 40) + 20,
    lexicon: Math.floor(Math.random() * 30) + 10,
  }))
}
