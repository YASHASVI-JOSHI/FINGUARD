import { Router } from 'express'
import { db } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'
import { scoreFraudTransaction } from '../services/ai.js'

export const adminRouter = Router()
// NOTE: this is a demo admin view reachable by any signed-in user, since this
// project has no role system yet. A real deployment would gate this behind
// an `isAdmin` flag on the user and a role-check middleware.
adminRouter.use(requireAuth)

adminRouter.get('/stats', (req, res) => {
  const users = db.users.find()
  const transactions = db.transactions.find()
  const loans = db.loans.find()
  const fraudRecords = db.fraudRecords.find().map((r) => ({ ...r, ...scoreFraudTransaction(r) }))

  const spendByUser = new Map()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    spendByUser.set(t.userId, (spendByUser.get(t.userId) || 0) + t.amount)
  }

  const topUsers = [...spendByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, totalSpent]) => {
      const user = db.users.findById(userId)
      return { name: user?.name || 'Unknown', email: user?.email || '—', totalSpent: Math.round(totalSpent) }
    })

  const recentActivity = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10)
    .map((t) => {
      const user = db.users.findById(t.userId)
      return {
        id: t._id,
        user: user?.name || 'Unknown',
        merchant: t.merchant,
        amount: t.amount,
        type: t.type,
        date: t.date,
      }
    })

  res.json({
    stats: {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      // mock subscription-revenue estimate — there's no real billing system here
      estimatedMonthlyRevenue: Math.round(users.length * 9.99 * 100) / 100,
      fraudCases: fraudRecords.filter((r) => r.status === 'flagged').length,
      activeLoans: loans.filter((l) => l.status === 'active').length,
    },
    topUsers,
    recentActivity,
    systemHealth: {
      status: 'operational',
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsedMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10,
    },
  })
})
