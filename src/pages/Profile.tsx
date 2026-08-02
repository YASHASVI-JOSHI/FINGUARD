import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { api } from '../api/client'
import { formatCurrency } from '../utils/format'
import type { User } from '../types'

interface ProfileForm {
  name: string
  monthlyIncome: number
  savingsTarget: number
  financialGoal: string
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const { transactions } = useTransactions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      monthlyIncome: user?.monthlyIncome || 0,
      savingsTarget: user?.savingsTarget || 0,
      financialGoal: user?.financialGoal || '',
    },
  })

  const monthlyReports = useMemo(() => {
    const byMonth: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) {
      const key = t.date.slice(0, 7)
      byMonth[key] ??= { income: 0, expense: 0 }
      if (t.type === 'income') byMonth[key].income += t.amount
      else byMonth[key].expense += t.amount
    }
    return Object.entries(byMonth)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 3)
      .map(([month, v]) => ({
        label: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        income: v.income,
        expense: v.expense,
        savings: v.income - v.expense,
      }))
  }, [transactions])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function onSubmit(data: ProfileForm) {
    setError(null)
    setSaved(false)
    try {
      const res = await api.put<{ user: User }>('/users/me', {
        name: data.name,
        monthlyIncome: Number(data.monthlyIncome),
        savingsTarget: Number(data.savingsTarget),
        financialGoal: data.financialGoal,
        avatarUrl: avatarPreview,
      })
      setUser(res.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Profile</h1>
        <p className="mt-1 text-sm text-muted">Your info, goals, and monthly reports.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-surface p-6 lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-muted">{user?.name?.[0]?.toUpperCase() || '?'}</span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-text" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <div>
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Full name</span>
              <input className="auth-input" {...register('name', { required: true })} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Monthly income ($)</span>
                <input type="number" className="auth-input" {...register('monthlyIncome', { min: 0 })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Savings target ($)</span>
                <input type="number" className="auth-input" {...register('savingsTarget', { min: 0 })} />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Financial goal</span>
              <input className="auth-input" placeholder="e.g. Build a 6-month emergency fund" {...register('financialGoal')} />
            </label>

            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSubmitting} className="auth-submit w-auto px-6">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-sm text-success"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.span>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">Monthly reports</h2>
          {monthlyReports.length === 0 ? (
            <p className="text-sm text-muted">No transaction history yet.</p>
          ) : (
            <div className="space-y-4">
              {monthlyReports.map((r) => (
                <div key={r.label} className="rounded-xl bg-card p-3.5">
                  <p className="text-xs font-medium text-text">{r.label}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase text-muted">Income</p>
                      <p className="text-sm font-semibold text-success">{formatCurrency(r.income)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted">Expense</p>
                      <p className="text-sm font-semibold text-danger">{formatCurrency(r.expense)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted">Saved</p>
                      <p className={`text-sm font-semibold ${r.savings >= 0 ? 'text-text' : 'text-danger'}`}>
                        {formatCurrency(r.savings)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
