import { Router } from 'express'
import { db } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'
import {
  predictCreditScore,
  checkLoanEligibility,
  scoreFraudTransaction,
  recommendInvestment,
  generateInsights,
  chatbotReply,
} from '../services/ai.js'

export const aiRouter = Router()
aiRouter.use(requireAuth)

aiRouter.get('/insights', (req, res) => {
  const transactions = db.transactions.find((t) => t.userId === req.user._id)
  res.json({ insights: generateInsights(transactions) })
})

aiRouter.post('/credit-score', (req, res) => {
  const { age, income, debt, emi, utilization, historyYears, openLoans } = req.body || {}
  if ([age, income, debt, emi, utilization, historyYears, openLoans].some((v) => v === undefined)) {
    return res.status(400).json({
      error: 'age, income, debt, emi, utilization, historyYears, and openLoans are all required',
    })
  }
  const result = predictCreditScore({ age, income, debt, emi, utilization, historyYears, openLoans })
  db.creditReports.insertOne({
    userId: req.user._id,
    score: result.score,
    riskLevel: result.riskLevel,
    utilization,
    generatedAt: new Date().toISOString(),
  })
  res.json(result)
})

aiRouter.post('/loan-eligibility', (req, res) => {
  const { salary, existingLoanEmi, creditScore, age, employmentType } = req.body || {}
  if ([salary, existingLoanEmi, creditScore, age, employmentType].some((v) => v === undefined)) {
    return res.status(400).json({
      error: 'salary, existingLoanEmi, creditScore, age, and employmentType are all required',
    })
  }
  const result = checkLoanEligibility({ salary, existingLoanEmi, creditScore, age, employmentType })
  res.json(result)
})

aiRouter.get('/fraud-detection', (req, res) => {
  const records = db.fraudRecords.find((f) => f.userId === req.user._id)
  const withScores = records.map((r) => ({ ...r, ...scoreFraudTransaction(r) }))
  const flaggedCount = withScores.filter((r) => r.status === 'flagged').length
  res.json({
    records: withScores,
    summary: {
      total: withScores.length,
      flagged: flaggedCount,
      underReview: withScores.filter((r) => r.status === 'under_review').length,
    },
  })
})

aiRouter.post('/investment-recommendation', (req, res) => {
  const { riskTolerance, income, age, goal, durationYears } = req.body || {}
  if ([riskTolerance, income, age, goal, durationYears].some((v) => v === undefined)) {
    return res.status(400).json({
      error: 'riskTolerance, income, age, goal, and durationYears are all required',
    })
  }
  res.json(recommendInvestment({ riskTolerance, income, age, goal, durationYears }))
})

aiRouter.post('/chat', (req, res) => {
  const { message } = req.body || {}
  if (!message) return res.status(400).json({ error: 'message is required' })
  res.json({ reply: chatbotReply(message) })
})
