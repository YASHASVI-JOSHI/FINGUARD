import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, Upload, FileCheck2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useTransactions } from '../hooks/useTransactions'
import { EXPENSE_CATEGORIES, PAYMENT_MODES, type Transaction } from '../types/finance'
import { formatCurrency, formatDate } from '../utils/format'
import Modal from '../components/Modal'

interface ExpenseForm {
  merchant: string
  category: string
  amount: number
  paymentMode: string
  date: string
  type: 'expense' | 'income'
  note: string
}

const CHART_COLORS = ['#3B82F6', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6', '#FCD34D']

export default function ExpenseTracker() {
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false
      if (paymentFilter !== 'All' && t.paymentMode !== paymentFilter) return false
      if (search) {
        const needle = search.toLowerCase()
        if (!t.merchant.toLowerCase().includes(needle) && !t.category.toLowerCase().includes(needle)) return false
      }
      return true
    })
  }, [transactions, search, categoryFilter, paymentFilter])

  const categoryChartData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    }
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [transactions])

  const monthlyTrendData = useMemo(() => {
    const byMonth: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const key = t.date.slice(0, 7)
      byMonth[key] = (byMonth[key] || 0) + t.amount
    }
    return Object.entries(byMonth)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-6)
      .map(([month, amount]) => ({
        month: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        amount,
      }))
  }, [transactions])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Expense Tracker</h1>
          <p className="mt-1 text-sm text-muted">Every transaction, searchable and filterable.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> Add transaction
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Spending by category">
          {categoryChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top categories">
          {categoryChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16283D" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Monthly trend">
          {monthlyTrendData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16283D" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="amount" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-surface p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant or category..."
            className="w-full rounded-lg border border-white/10 bg-card py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-muted/60 outline-none focus:border-accent"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option>All</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="filter-select">
          <option>All</option>
          {PAYMENT_MODES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted">Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No transactions match your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Merchant</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((t) => (
                <tr key={t._id} className="transition-colors hover:bg-card/40">
                  <td className="px-5 py-3 font-medium text-text">{t.merchant}</td>
                  <td className="px-5 py-3 text-muted">{t.category}</td>
                  <td className="px-5 py-3 text-muted">{t.paymentMode}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(t.date)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type === 'income' ? 'text-success' : 'text-text'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-accent">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onCreate={addTransaction}
        onUpdate={updateTransaction}
      />
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-text">{title}</h2>
      {children}
    </div>
  )
}

function EmptyChart() {
  return <div className="flex h-[220px] items-center justify-center text-sm text-muted">Not enough data yet</div>
}

const tooltipStyle = {
  background: '#16283D',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
}

function ExpenseModal({
  isOpen,
  onClose,
  editing,
  onCreate,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  editing: Transaction | null
  onCreate: (input: {
    category: string
    merchant: string
    amount: number
    paymentMode: string
    date: string
    type: 'income' | 'expense'
    note?: string
  }) => Promise<void>
  onUpdate: (id: string, patch: Partial<Transaction>) => Promise<void>
}) {
  const [receiptName, setReceiptName] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    values: editing
      ? {
          merchant: editing.merchant,
          category: editing.category,
          amount: editing.amount,
          paymentMode: editing.paymentMode,
          date: editing.date.slice(0, 10),
          type: editing.type,
          note: editing.note || '',
        }
      : {
          merchant: '',
          category: EXPENSE_CATEGORIES[0],
          amount: 0,
          paymentMode: PAYMENT_MODES[0],
          date: new Date().toISOString().slice(0, 10),
          type: 'expense',
          note: '',
        },
  })

  async function onSubmit(data: ExpenseForm) {
    const payload = { ...data, amount: Number(data.amount) }
    if (editing) {
      await onUpdate(editing._id, payload)
    } else {
      await onCreate(payload)
    }
    reset()
    setReceiptName(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit transaction' : 'Add transaction'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-muted">Merchant</span>
            <input className="auth-input" {...register('merchant', { required: 'Required' })} />
            {errors.merchant && <p className="mt-1 text-xs text-danger">{errors.merchant.message}</p>}
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-muted">Amount</span>
            <input type="number" step="0.01" className="auth-input" {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be positive' } })} />
            {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
            <select className="auth-input" {...register('type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-muted">Category</span>
            <select className="auth-input" {...register('category', { required: true })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-muted">Payment mode</span>
            <select className="auth-input" {...register('paymentMode', { required: true })}>
              {PAYMENT_MODES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-muted">Date</span>
            <input type="date" className="auth-input" {...register('date', { required: 'Required' })} />
          </label>

          <label className="col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-muted">Note (optional)</span>
            <input className="auth-input" {...register('note')} />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Receipt (optional)</span>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-card px-4 py-3 text-xs text-muted transition-colors hover:border-accent hover:text-text">
            {receiptName ? <FileCheck2 className="h-4 w-4 text-success" /> : <Upload className="h-4 w-4" />}
            {receiptName || 'Upload a receipt image'}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <p className="mt-1 text-[11px] text-muted/70">
            Storage isn't wired up yet — this just previews the filename for now.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-text">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 auth-submit">
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
