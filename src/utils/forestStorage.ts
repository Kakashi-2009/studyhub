export interface Tree {
  id: string
  type: 'pine' | 'cherry' | 'palm' | 'maple' | 'bamboo'
  duration: number
  completedAt: string
  tag: string
  coins: number
  withered: boolean
}

export interface ForestStreak {
  current: number
  longest: number
  lastDate: string | null
}

const FOREST_KEY = 'studyhub_forest'
const COINS_KEY = 'studyhub_coins'
const STREAK_KEY = 'studyhub_forest_streak'

export function getForest(): Tree[] {
  const data = localStorage.getItem(FOREST_KEY)
  return data ? JSON.parse(data) : []
}

export function addTree(tree: Tree): void {
  const forest = getForest()
  forest.push(tree)
  localStorage.setItem(FOREST_KEY, JSON.stringify(forest))
}

export function getCoins(): number {
  return Number(localStorage.getItem(COINS_KEY) || 0)
}

export function addCoins(amount: number): void {
  const current = getCoins()
  localStorage.setItem(COINS_KEY, String(current + amount))
}

export function getForestStreak(): ForestStreak {
  const data = localStorage.getItem(STREAK_KEY)
  if (!data) return { current: 0, longest: 0, lastDate: null }
  return JSON.parse(data) as ForestStreak
}

export function saveForestStreak(streak: ForestStreak): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
}
