import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { api } from '../api/client'
import { formatCurrency, formatDate } from '../utils/format'
import GaugeMeter from '../components/GaugeMeter'

interface FraudRecord {
  _id: string
  merchant: string
  amount: number
  location: string
  device: string
  time: string
  riskScore: number
  status: 'flagged' | 'under_review' | 'clear'
}

interface FraudResponse {
  records: FraudRecord[]
  summary: { total: number; flagged: number; underReview: number }
}

const STATUS_STYLES: Record<FraudRecord['status'], { label: string; className: string; icon: typeof ShieldAlert }> = {
  flagged: { label: 'Flagged', className: 'bg-danger/10 text-danger', icon: ShieldAlert },
  under_review: { label: 'Under review', className: 'bg-warning/10 text-warning', icon: ShieldQuestion },
  clear: { label: 'Clear', className: 'bg-success/10 text-success', icon: ShieldCheck },
}

export default function FraudDetection() {
  const [data, setData] = useState<FraudResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<FraudResponse>('/ai/fraud-detection')
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  const overallRisk = data && data.records.length
    ? Math.round((data.records.reduce((s, r) => s + r.riskScore, 0) / data.records.length) * 100)
    : 0

  // simple location-based heatmap: count of flagged/reviewed transactions per location
  const locationCounts: Record<string, number> = {}
  data?.records.forEach((r) => {
    if (r.status !== 'clear') locationCounts[r.location] = (locationCounts[r.location] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Fraud Detection</h1>
        <p className="mt-1 text-sm text-muted">Every transaction is scored for unusual location, device, and amount patterns.</p>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-white/5 bg-surface" />
      ) : !data || data.records.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center text-sm text-muted">
          No transaction records to score yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-surface p-6">
              <GaugeMeter value={overallRisk} label={`${overallRisk}/100`} sublabel="Overall risk score" />
            </div>
            <SummaryTile label="Total scored" value={String(data.summary.total)} />
            <div className="grid grid-cols-1 gap-4">
              <SummaryTile label="Flagged" value={String(data.summary.flagged)} tone="danger" />
              <SummaryTile label="Under review" value={String(data.summary.underReview)} tone="warning" />
            </div>
          </div>

          {Object.keys(locationCounts).length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-text">Risk by location</h2>
              <div className="space-y-2">
                {Object.entries(locationCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([loc, count]) => (
                    <div key={loc} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 truncate text-xs text-muted">{loc}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-card">
                        <div
                          className="h-full rounded-full bg-danger"
                          style={{ width: `${Math.min(100, (count / data.summary.total) * 100 * 4)}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs text-muted">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Merchant</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.records.map((r) => {
                  const style = STATUS_STYLES[r.status]
                  const Icon = style.icon
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={r.status === 'flagged' ? 'bg-danger/5' : ''}
                    >
                      <td className="px-5 py-3 font-medium text-text">{r.merchant}</td>
                      <td className="px-5 py-3 text-muted">{formatCurrency(r.amount)}</td>
                      <td className="px-5 py-3 text-muted">{r.location}</td>
                      <td className="px-5 py-3 text-muted">{r.device}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(r.time)}</td>
                      <td className="px-5 py-3 text-muted">{Math.round(r.riskScore * 100)}%</td>
                      <td className="px-5 py-3">
                        <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}>
                          <Icon className="h-3.5 w-3.5" /> {style.label}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone?: 'danger' | 'warning' }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-text'
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-white/5 bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}
