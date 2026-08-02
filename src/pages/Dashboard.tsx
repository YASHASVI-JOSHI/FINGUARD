import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  LineChart as LineChartIcon,
  Plus,
  ArrowRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { api } from '../api/client'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate, currentPeriod, isInPeriod, clampPercent } from '../utils/format'
import StatCard from '../components/StatCard'

interface Insight {
  type: string
  title: string
  detail: string
}
interface FraudRecord {
  _id: string
  merchant: string
  amount: number
  location: string
  riskScore: number
  status: string
  time: string
}

const CHART_COLORS = ['#3B82F6', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6']

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions, isLoading: txLoading } = useTransactions()
  const { budgets, isLoading: budgetsLoading } = useBudgets()
  const [insights, setInsights] = useState<Insight[]>([])
  const [fraudAlerts, setFraudAlerts] = useState<FraudRecord[]>([])

  useEffect(() => {
    api.get<{ insights: Insight[] }>('/ai/insights').then((r) => setInsights(r.insights)).catch(() => {})
    api
      .get<{ records: FraudRecord[] }>('/ai/fraud-detection')
      .then((r) => setFraudAlerts(r.records.filter((f) => f.status !== 'clear').slice(0, 3)))
      .catch(() => {})
  }, [])

  const period = currentPeriod()

  const { monthlyIncome, monthlyExpense, totalBalance, categoryTotals, trend } = useMemo(() => {
    let income = 0
    let expense = 0
    let allIncome = 0
    let allExpense = 0
    const byCategory: Record<string, number> = {}
    const byDay: Record<string, number> = {}

    for (const t of transactions) {
      if (t.type === 'income') {
        allIncome += t.amount
        if (isInPeriod(t.date, period)) income += t.amount
      } else {
        allExpense += t.amount
        if (isInPeriod(t.date, period)) {
          expense += t.amount
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
        }
        const day = t.date.slice(0, 10)
        byDay[day] = (byDay[day] || 0) + t.amount
      }
    }

    const trendData = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([date, amount]) => ({ date: formatDate(date).slice(0, 6), amount }))

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      totalBalance: allIncome - allExpense,
      categoryTotals: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
      trend: trendData,
    }
  }, [transactions, period])

  const savings = monthlyIncome - monthlyExpense
  const savingsRate = monthlyIncome > 0 ? savings / monthlyIncome : 0
  const healthScore = clampPercent(50 + savingsRate * 100)

  const recentTransactions = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6)

  const budgetProgress = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === b.category && isInPeriod(t.date, period))
      .reduce((sum, t) => sum + t.amount, 0)
    return { ...b, spent, pct: clampPercent((spent / b.monthlyLimit) * 100) }
  })

  const isLoading = txLoading || budgetsLoading

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted">Here's where your money stands this month.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/expenses"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" /> Add expense
          </Link>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={Wallet} label="Total balance" value={formatCurrency(totalBalance)} delay={0} />
            <StatCard icon={TrendingUp} label="Monthly income" value={formatCurrency(monthlyIncome)} tone="success" delay={0.05} />
            <StatCard icon={TrendingDown} label="Monthly expense" value={formatCurrency(monthlyExpense)} tone="danger" delay={0.1} />
            <StatCard icon={PiggyBank} label="Savings this month" value={formatCurrency(savings)} tone={savings >= 0 ? 'success' : 'danger'} delay={0.15} />
            <StatCard icon={HeartPulse} label="Financial health" value={`${healthScore} / 100`} tone={healthScore >= 60 ? 'success' : 'warning'} delay={0.2} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-surface p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-text">Expense trend (last 14 days)</h2>
              {trend.length === 0 ? (
                <EmptyChart message="No expenses logged yet" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#16283D" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={50} />
                    <Tooltip
                      contentStyle={{ background: '#16283D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      labelStyle={{ color: '#F8FAFC' }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} fill="url(#expenseFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <h2 className="mb-4 text-sm font-semibold text-text">Spending by category</h2>
              {categoryTotals.length === 0 ? (
                <EmptyChart message="No spending yet this month" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryTotals} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {categoryTotals.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#16283D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {categoryTotals.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-surface p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text">Recent transactions</h2>
                <Link to="/expenses" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {recentTransactions.length === 0 ? (
                <EmptyChart message="No transactions yet" />
              ) : (
                <div className="divide-y divide-white/5">
                  {recentTransactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-text">{t.merchant}</p>
                        <p className="text-xs text-muted">
                          {t.category} · {formatDate(t.date)}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-text'}`}>
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-surface p-5">
              <h2 className="mb-4 text-sm font-semibold text-text">Budget progress</h2>
              {budgetProgress.length === 0 ? (
                <EmptyChart message="No budgets set yet" />
              ) : (
                <div className="space-y-4">
                  {budgetProgress.slice(0, 5).map((b) => (
                    <div key={b._id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-text">{b.category}</span>
                        <span className={b.pct >= 100 ? 'text-danger' : 'text-muted'}>
                          {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-card">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${b.pct}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${b.pct >= 100 ? 'bg-danger' : b.pct >= 80 ? 'bg-warning' : 'bg-primary'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <InfoCard icon={Sparkles} title="AI tips" accent="text-accent" linkTo="/insights">
              {insights.slice(0, 2).map((tip, i) => (
                <p key={i} className="text-xs leading-relaxed text-muted">
                  <span className="font-medium text-text">{tip.title}.</span> {tip.detail}
                </p>
              ))}
              {insights.length === 0 && <p className="text-xs text-muted">No insights yet — add a few transactions first.</p>}
            </InfoCard>

            <InfoCard icon={ShieldAlert} title="Fraud alerts" accent="text-danger" linkTo="/fraud-detection">
              {fraudAlerts.length === 0 && <p className="text-xs text-muted">No suspicious activity detected.</p>}
              {fraudAlerts.map((f) => (
                <p key={f._id} className="text-xs leading-relaxed text-muted">
                  <span className="font-medium text-text">{f.merchant}</span> — {formatCurrency(f.amount)} flagged from {f.location}
                </p>
              ))}
            </InfoCard>

            <InfoCard icon={LineChartIcon} title="Investment suggestion" accent="text-success" linkTo="/investments">
              <p className="text-xs leading-relaxed text-muted">
                Based on typical goals for your profile, a balanced mix of index funds and bonds tends to outperform
                cash savings over 5+ years.
              </p>
            </InfoCard>
          </div>
        </>
      )}
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  accent,
  linkTo,
  children,
}: {
  icon: typeof Sparkles
  title: string
  accent: string
  linkTo: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${accent}`} />
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
        <Link to={linkTo} className="text-xs font-medium text-accent hover:underline">
          Details
        </Link>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-[220px] items-center justify-center text-sm text-muted">{message}</div>
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-surface" />
      ))}
    </div>
  )
}
