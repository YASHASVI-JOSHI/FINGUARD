import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Gauge, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../api/client'
import GaugeMeter from '../components/GaugeMeter'

interface CreditForm {
  age: number
  income: number
  debt: number
  emi: number
  utilization: number
  historyYears: number
  openLoans: number
}

interface CreditResult {
  score: number
  riskLevel: string
  reasons: string[]
  tips: string[]
}

export default function CreditScore() {
  const [result, setResult] = useState<CreditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreditForm>({
    defaultValues: { age: 30, income: 5000, debt: 8000, emi: 400, utilization: 0.3, historyYears: 4, openLoans: 1 },
  })

  async function onSubmit(data: CreditForm) {
    setError(null)
    try {
      const payload = {
        age: Number(data.age),
        income: Number(data.income),
        debt: Number(data.debt),
        emi: Number(data.emi),
        utilization: Number(data.utilization),
        historyYears: Number(data.historyYears),
        openLoans: Number(data.openLoans),
      }
      const res = await api.post<CreditResult>('/ai/credit-score', payload)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not predict your credit score')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Credit Score</h1>
        <p className="mt-1 text-sm text-muted">Get a predicted score based on your current profile.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Age" error={errors.age?.message} {...register('age', { required: 'Required', min: 18, max: 100 })} />
              <NumField label="Monthly income ($)" error={errors.income?.message} {...register('income', { required: 'Required', min: 0 })} />
              <NumField label="Total debt ($)" error={errors.debt?.message} {...register('debt', { required: 'Required', min: 0 })} />
              <NumField label="Monthly EMI ($)" error={errors.emi?.message} {...register('emi', { required: 'Required', min: 0 })} />
              <NumField
                label="Credit utilization (0-1)"
                step="0.01"
                error={errors.utilization?.message}
                {...register('utilization', { required: 'Required', min: 0, max: 1 })}
              />
              <NumField label="Credit history (years)" error={errors.historyYears?.message} {...register('historyYears', { required: 'Required', min: 0 })} />
              <NumField label="Open loans" error={errors.openLoans?.message} {...register('openLoans', { required: 'Required', min: 0 })} />
            </div>

            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Gauge className="h-4 w-4" /> Predict my score
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted">
              Fill in the form and submit to see your predicted score.
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
              <GaugeMeter value={(result.score / 900) * 100} label={`${result.score} / 900`} sublabel={`${result.riskLevel} risk`} />

              <div className="mt-6 w-full space-y-4">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Why this score</h3>
                  <ul className="space-y-1.5">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tips to improve</h3>
                  <ul className="space-y-1.5">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function NumField({
  label,
  error,
  step,
  ...rest
}: { label: string; error?: string; step?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input type="number" step={step || '1'} className="auth-input" {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </label>
  )
}
