import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react'
import { api } from '../api/client'

interface Insight {
  type: string
  title: string
  detail: string
}

const ICONS: Record<string, typeof Sparkles> = {
  spend_alert: TrendingDown,
  suggestion: Lightbulb,
  tip: Sparkles,
}

const ACCENTS: Record<string, string> = {
  spend_alert: 'text-warning',
  suggestion: 'text-accent',
  tip: 'text-success',
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setIsLoading(true)
    setError(null)
    api
      .get<{ insights: Insight[] }>('/ai/insights')
      .then((r) => setInsights(r.insights))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load insights'))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">AI Insights</h1>
          <p className="mt-1 text-sm text-muted">
            Observations generated from your recent spending patterns.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/5 bg-surface" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">{error}</div>
      ) : insights.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center text-sm text-muted">
          Add a few transactions on the Expense Tracker page and insights will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {insights.map((insight, i) => {
            const Icon = ICONS[insight.type] || Sparkles
            const accent = ACCENTS[insight.type] || 'text-accent'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/5 bg-surface p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-card">
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <h3 className="font-semibold text-text">{insight.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{insight.detail}</p>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
