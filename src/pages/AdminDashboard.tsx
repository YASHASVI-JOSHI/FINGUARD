import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Receipt, DollarSign, ShieldAlert, Landmark, Activity, Cpu } from 'lucide-react'
import { api } from '../api/client'
import { formatCurrency, formatDate } from '../utils/format'
import StatCard from '../components/StatCard'

interface AdminStats {
  stats: {
    totalUsers: number
    totalTransactions: number
    estimatedMonthlyRevenue: number
    fraudCases: number
    activeLoans: number
  }
  topUsers: { name: string; email: string; totalSpent: number }[]
  recentActivity: { id: string; user: string; merchant: string; amount: number; type: string; date: string }[]
  systemHealth: { status: string; uptimeSeconds: number; memoryUsedMb: number }
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<AdminStats>('/admin/stats')
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-surface" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="rounded-2xl border border-white/5 bg-surface p-8 text-center text-sm text-muted">Could not load admin stats.</div>
  }

  const uptimeMinutes = Math.floor(data.systemHealth.uptimeSeconds / 60)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Platform-wide stats across all accounts.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Total users" value={String(data.stats.totalUsers)} />
        <StatCard icon={Receipt} label="Transactions" value={String(data.stats.totalTransactions)} />
        <StatCard icon={DollarSign} label="Est. monthly revenue" value={formatCurrency(data.stats.estimatedMonthlyRevenue)} tone="success" />
        <StatCard icon={ShieldAlert} label="Fraud cases" value={String(data.stats.fraudCases)} tone={data.stats.fraudCases > 0 ? 'danger' : 'default'} />
        <StatCard icon={Landmark} label="Active loans" value={String(data.stats.activeLoans)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-text">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted">No activity yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentActivity.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text">
                      {a.user} <span className="font-normal text-muted">→ {a.merchant}</span>
                    </p>
                    <p className="text-xs text-muted">{formatDate(a.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${a.type === 'income' ? 'text-success' : 'text-text'}`}>
                    {a.type === 'income' ? '+' : '-'}
                    {formatCurrency(a.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">Top users by spend</h2>
            {data.topUsers.length === 0 ? (
              <p className="text-sm text-muted">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topUsers.map((u, i) => (
                  <div key={u.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-semibold text-muted">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-text">{formatCurrency(u.totalSpent)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">System health</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Status</span>
                <span className="flex items-center gap-1.5 font-medium text-success">
                  <Activity className="h-3.5 w-3.5" /> {data.systemHealth.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Uptime</span>
                <span className="text-text">{uptimeMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Memory used</span>
                <span className="text-text">{data.systemHealth.memoryUsedMb} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
