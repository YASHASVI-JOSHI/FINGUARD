import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { LineChart as LineChartIcon, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import GaugeMeter from '../components/GaugeMeter'

interface InvestForm {
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive'
  income: number
  age: number
  goal: string
  durationYears: number
}

interface InvestResult {
  allocation: Record<string, number>
  expectedAnnualReturn: number
  riskLevel: string
  projection: { durationYears: number; note: string }
  suitableFor: string
}

const CHART_COLORS = ['#3B82F6', '#38BDF8', '#F59E0B', '#10B981', '#A78BFA', '#F472B6']
const RISK_TO_GAUGE: Record<string, number> = { Conservative: 30, Moderate: 60, Aggressive: 90 }

export default function InvestmentAdvisor() {
  const [result, setResult] = useState<InvestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<InvestForm>({
    defaultValues: { riskTolerance: 'Moderate', income: 5000, age: 30, goal: 'Retirement', durationYears: 10 },
  })

  async function onSubmit(data: InvestForm) {
    setError(null)
    try {
      const res = await api.post<InvestResult>('/ai/investment-recommendation', {
        ...data,
        income: Number(data.income),
        age: Number(data.age),
        durationYears: Number(data.durationYears),
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a recommendation')
    }
  }

  const chartData = result
    ? Object.entries(result.allocation)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Investment Advisor</h1>
        <p className="mt-1 text-sm text-muted">A recommended allocation tuned to your goals and risk tolerance.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Risk tolerance</span>
              <select className="auth-input" {...register('riskTolerance')}>
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Monthly income ($)</span>
                <input type="number" className="auth-input" {...register('income', { required: true, min: 0 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Age</span>
                <input type="number" className="auth-input" {...register('age', { required: true, min: 18 })} />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Goal</span>
              <input className="auth-input" {...register('goal', { required: true })} placeholder="e.g. Retirement, House down payment" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Time horizon (years)</span>
              <input type="number" className="auth-input" {...register('durationYears', { required: true, min: 1 })} />
            </label>

            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <LineChartIcon className="h-4 w-4" /> Get recommendation
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted">
              Fill in the form and submit to see your recommended allocation.
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between gap-4">
                <ResponsiveContainer width="60%" height={180}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#16283D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      formatter={(v: number) => `${v}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <GaugeMeter value={RISK_TO_GAUGE[result.riskLevel] ?? 60} label={result.riskLevel} sublabel="Risk level" size={150} />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {chartData.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {c.name} · {c.value}%
                  </span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-card p-3">
                  <p className="text-xs text-muted">Expected annual return</p>
                  <p className="mt-1 text-lg font-bold text-success">{result.expectedAnnualReturn}%</p>
                </div>
                <div className="rounded-xl bg-card p-3">
                  <p className="text-xs text-muted">Suitable for</p>
                  <p className="mt-1 text-xs font-medium text-text">{result.suitableFor}</p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted">{result.projection.note}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
