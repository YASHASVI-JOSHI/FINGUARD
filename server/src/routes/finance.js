import { Router } from 'express'
import { db } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'

export const financeRouter = Router()
financeRouter.use(requireAuth)

// ---- Transactions ----

financeRouter.get('/transactions', (req, res) => {
  const { category, paymentMode, from, to, q } = req.query
  let rows = db.transactions.find((t) => t.userId === req.user._id)

  if (category) rows = rows.filter((t) => t.category === category)
  if (paymentMode) rows = rows.filter((t) => t.paymentMode === paymentMode)
  if (from) rows = rows.filter((t) => t.date >= from)
  if (to) rows = rows.filter((t) => t.date <= to)
  if (q) {
    const needle = String(q).toLowerCase()
    rows = rows.filter(
      (t) => t.merchant.toLowerCase().includes(needle) || t.category.toLowerCase().includes(needle),
    )
  }

  rows = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
  res.json({ transactions: rows })
})

financeRouter.post('/transactions', (req, res) => {
  const { category, merchant, amount, paymentMode, date, type, tags, note } = req.body || {}
  if (!category || !merchant || !amount) {
    return res.status(400).json({ error: 'category, merchant, and amount are required' })
  }
  const txn = db.transactions.insertOne({
    userId: req.user._id,
    category,
    merchant,
    amount: Number(amount),
    paymentMode: paymentMode || 'Debit Card',
    date: date || new Date().toISOString(),
    type: type || 'expense',
    tags: tags || [],
    note: note || '',
  })
  res.status(201).json({ transaction: txn })
})

financeRouter.put('/transactions/:id', (req, res) => {
  const existing = db.transactions.findById(req.params.id)
  if (!existing || existing.userId !== req.user._id) {
    return res.status(404).json({ error: 'Transaction not found' })
  }
  const updated = db.transactions.updateOne(req.params.id, req.body || {})
  res.json({ transaction: updated })
})

financeRouter.delete('/transactions/:id', (req, res) => {
  const existing = db.transactions.findById(req.params.id)
  if (!existing || existing.userId !== req.user._id) {
    return res.status(404).json({ error: 'Transaction not found' })
  }
  db.transactions.deleteOne(req.params.id)
  res.status(204).end()
})

// ---- Budgets ----

financeRouter.get('/budgets', (req, res) => {
  res.json({ budgets: db.budgets.find((b) => b.userId === req.user._id) })
})

financeRouter.post('/budgets', (req, res) => {
  const { category, monthlyLimit } = req.body || {}
  if (!category || !monthlyLimit) {
    return res.status(400).json({ error: 'category and monthlyLimit are required' })
  }
  const budget = db.budgets.insertOne({
    userId: req.user._id,
    category,
    monthlyLimit: Number(monthlyLimit),
    period: new Date().toISOString().slice(0, 7),
  })
  res.status(201).json({ budget })
})

financeRouter.put('/budgets/:id', (req, res) => {
  const existing = db.budgets.findById(req.params.id)
  if (!existing || existing.userId !== req.user._id) {
    return res.status(404).json({ error: 'Budget not found' })
  }
  res.json({ budget: db.budgets.updateOne(req.params.id, req.body || {}) })
})

financeRouter.delete('/budgets/:id', (req, res) => {
  const existing = db.budgets.findById(req.params.id)
  if (!existing || existing.userId !== req.user._id) {
    return res.status(404).json({ error: 'Budget not found' })
  }
  db.budgets.deleteOne(req.params.id)
  res.status(204).end()
})
