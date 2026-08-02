import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Landmark, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../api/client'
import { formatCurrency } from '../utils/format'

interface LoanForm {
  salary: number
  occupation: string
  existingLoanEmi: number
  creditScore: number
  age: number
  employmentType: string
}

interface LoanResult {
  eligible: boolean
  probability: number
  maxLoanAmount: number
  interestRate: number
  estimatedEmi: number
  termMonths: number
  reasons: string[]
  recommendations: string[]
}

export default function LoanEligibility() {
  const [result, setResult] = useState<LoanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoanForm>({
    defaultValues: {
      salary: 5000,
      occupation: 'Software Engineer',
      existingLoanEmi: 400,
      creditScore: 700,
      age: 30,
      employmentType: 'Salaried',
    },
  })

  async function onSubmit(data: LoanForm) {
    setError(null)
    try {
      const res = await api.post<LoanResult>('/ai/loan-eligibility', {
        salary: Number(data.salary),
        occupation: data.occupation,
        existingLoanEmi: Number(data.existingLoanEmi),
        creditScore: Number(data.creditScore),
        age: Number(data.age),
        employmentType: data.employmentType,
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check eligibility')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Loan Eligibility</h1>
        <p className="mt-1 text-sm text-muted">Check eligibility, estimated amount, interest, and EMI.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Monthly salary ($)</span>
                <input type="number" className="auth-input" {...register('salary', { required: true, min: 0 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Occupation</span>
                <input className="auth-input" {...register('occupation')} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Existing loan EMI ($)</span>
                <input type="number" className="auth-input" {...register('existingLoanEmi', { required: true, min: 0 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Credit score</span>
                <input type="number" className="auth-input" {...register('creditScore', { required: true, min: 300, max: 900 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Age</span>
                <input type="number" className="auth-input" {...register('age', { required: true, min: 18, max: 100 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Employment type</span>
                <select className="auth-input" {...register('employmentType')}>
                  <option>Salaried</option>
                  <option>Self-Employed</option>
                  <option>Contract</option>
                </select>
              </label>
            </div>

            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Landmark className="h-4 w-4" /> Check eligibility
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted">
              Fill in the form and submit to see your result.
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className={`flex items-center gap-3 rounded-xl p-4 ${
                  result.eligible ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}
              >
                {result.eligible ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                <div>
                  <p className="font-semibold">{result.eligible ? 'You\'re likely eligible' : 'Not currently eligible'}</p>
                  <p className="text-xs opacity-80">{Math.round(result.probability * 100)}% estimated approval probability</p>
                </div>
              </div>

              {result.eligible && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <ResultStat label="Max loan amount" value={formatCurrency(result.maxLoanAmount)} />
                  <ResultStat label="Interest rate" value={`${result.interestRate}%`} />
                  <ResultStat label="Estimated EMI" value={formatCurrency(result.estimatedEmi)} />
                  <ResultStat label="Term" value={`${result.termMonths} months`} />
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Reasons</h3>
                <ul className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-muted">
                      • {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Recommendations</h3>
                <ul className="space-y-1.5">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-muted">
                      • {r}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </div>
  )
}
