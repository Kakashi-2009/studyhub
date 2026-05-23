import { FocusTimer } from '../components/FocusTimer'
import { Header } from '../components/Header'
import { HomeworkCard } from '../components/HomeworkCard'
import { LexiconWidget } from '../components/LexiconWidget'
import { ProgressGraph } from '../components/ProgressGraph'
import { QuoteCard } from '../components/QuoteCard'

export function Dashboard() {
  return (
    <div>
      <Header />
      <div className="mb-4">
        <LexiconWidget />
      </div>
      <ProgressGraph />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-h-[360px] lg:col-span-1">
          <HomeworkCard />
        </div>
        <div className="min-h-[360px] lg:col-span-1">
          <FocusTimer />
        </div>
        <div className="min-h-[360px] lg:col-span-1">
          <QuoteCard />
        </div>
      </div>
    </div>
  )
}
