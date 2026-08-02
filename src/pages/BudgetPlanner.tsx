import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useBudgets } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { EXPENSE_CATEGORIES, type Budget } from '../types/finance'
import { formatCurrency, currentPeriod, isInPeriod, clampPercent } from '../utils/format'
import Modal from '../components/Modal'

interface BudgetForm {
  category: string
  monthlyLimit: number
}

export default function BudgetPlanner() {
  const { budgets, isLoading, addBudget, updateBudget, deleteBudget } = useBudgets()
  const { transactions } = useTransactions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const period = currentPeriod()

  const rows = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category && isInPeriod(t.date, period))
        .reduce((sum, t) => sum + t.amount, 0)
      const pct = clampPercent((spent / b.monthlyLimit) * 100)
      return { ...b, spent, pct, isOverspent: spent > b.monthlyLimit }
    })
  }, [budgets, transactions, period])

  const totalBudgeted = rows.reduce((s, b) => s + b.monthlyLimit, 0)
  const totalSpent = rows.reduce((s, b) => s + b.spent, 0)
  const overspentCount = rows.filter((r) => r.isOverspent).length

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(b: Budget) {
    setEditing(b)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this budget?')) {
      await deleteBudget(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Budget Planner</h1>
          <p className="mt-1 text-sm text-muted">Set monthly limits per category and track progress.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> New budget
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total budgeted" value={formatCurrency(totalBudgeted)} />
        <SummaryCard label="Total spent" value={formatCurrency(totalSpent)} tone={totalSpent > totalBudgeted ? 'danger' : 'success'} />
        <SummaryCard
          label="Categories over budget"
          value={String(overspentCount)}
          tone={overspentCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/5 bg-surface p-8 text-center text-sm text-muted">
          Loading budgets…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center">
          <p className="text-sm text-muted">No budgets yet. Create one to start tracking overspend alerts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((b) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-surface p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text">{b.category}</h3>
                  <p className="text-xs text-muted">
                    {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-accent">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-card">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${b.isOverspent ? 'bg-danger' : b.pct >= 80 ? 'bg-warning' : 'bg-primary'}`}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted">{b.pct}% used</span>
                {b.isOverspent ? (
                  <span className="flex items-center gap-1 font-medium text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" /> Over budget
                  </span>
                ) : b.pct >= 80 ? (
                  <span className="flex items-center gap-1 font-medium text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" /> Close to limit
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> On track
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        existingCategories={budgets.map((b) => b.category)}
        onCreate={addBudget}
        onUpdate={updateBudget}
      />
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-text'
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}

function BudgetModal({
  isOpen,
  onClose,
  editing,
  existingCategories,
  onCreate,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  editing: Budget | null
  existingCategories: string[]
  onCreate: (input: { category: string; monthlyLimit: number }) => Promise<void>
  onUpdate: (id: string, patch: Partial<Budget>) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetForm>({
    values: editing
      ? { category: editing.category, monthlyLimit: editing.monthlyLimit }
      : { category: EXPENSE_CATEGORIES[0], monthlyLimit: 0 },
  })

  const availableCategories = editing
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter((c) => !existingCategories.includes(c))

  async function onSubmit(data: BudgetForm) {
    const payload = { category: data.category, monthlyLimit: Number(data.monthlyLimit) }
    if (editing) {
      await onUpdate(editing._id, payload)
    } else {
      await onCreate(payload)
    }
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit budget' : 'New budget'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Category</span>
          <select className="auth-input" disabled={!!editing} {...register('category', { required: true })}>
            {(availableCategories.length ? availableCategories : [editing?.category ?? EXPENSE_CATEGORIES[0]]).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Monthly limit</span>
          <input
            type="number"
            step="1"
            className="auth-input"
            {...register('monthlyLimit', { required: 'Required', min: { value: 1, message: 'Must be positive' } })}
          />
          {errors.monthlyLimit && <p className="mt-1 text-xs text-danger">{errors.monthlyLimit.message}</p>}
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-text">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 auth-submit">
            {editing ? 'Save changes' : 'Create budget'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
