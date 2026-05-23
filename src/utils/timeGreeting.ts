export function getTimeGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { greeting: 'Good Morning', emoji: '☀️' }
  if (hour < 17) return { greeting: 'Good Afternoon', emoji: '🌆' }
  return { greeting: 'Good Evening', emoji: '🌙' }
}

export function getTodayIndex(): number {
  return new Date().getDay()
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
