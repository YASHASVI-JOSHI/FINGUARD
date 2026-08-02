import { db } from './db.js'

const CATEGORIES = [
  'Groceries',
  'Rent',
  'Dining',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Subscriptions',
  'Travel',
  'Education',
  'Insurance',
]

const MERCHANTS = {
  Groceries: ['Whole Foods', 'Trader Joe\'s', 'Local Market'],
  Rent: ['Skyline Apartments'],
  Dining: ['Chipotle', 'Blue Bottle Coffee', 'Olive Garden', 'Local Diner'],
  Transport: ['Uber', 'Lyft', 'Metro Transit', 'Shell Gas'],
  Utilities: ['ConEd', 'City Water', 'Comcast'],
  Entertainment: ['Netflix', 'AMC Theatres', 'Spotify', 'Steam'],
  Shopping: ['Amazon', 'Target', 'Best Buy', 'Zara'],
  Healthcare: ['CVS Pharmacy', 'City Medical Group'],
  Subscriptions: ['Adobe', 'iCloud', 'Notion', 'Gym Membership'],
  Travel: ['Delta Airlines', 'Airbnb', 'Marriott'],
  Education: ['Coursera', 'Udemy', 'Campus Bookstore'],
  Insurance: ['State Farm', 'Blue Cross'],
}

const PAYMENT_MODES = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash']

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function generateTransactions(userId, count = 130) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const category = pick(CATEGORIES)
    const merchant = pick(MERCHANTS[category])
    const isIncome = category === 'Rent' ? false : Math.random() < 0.06
    const baseAmount = {
      Rent: randInt(1400, 2200),
      Groceries: randInt(15, 140),
      Dining: randInt(8, 90),
      Transport: randInt(5, 60),
      Utilities: randInt(40, 220),
      Entertainment: randInt(8, 60),
      Shopping: randInt(15, 350),
      Healthcare: randInt(10, 300),
      Subscriptions: randInt(5, 25),
      Travel: randInt(80, 900),
      Education: randInt(20, 400),
      Insurance: randInt(60, 250),
    }[category]

    rows.push(
      db.transactions.insertOne({
        userId,
        type: isIncome ? 'income' : 'expense',
        category: isIncome ? 'Income' : category,
        merchant: isIncome ? 'Employer Inc.' : merchant,
        amount: isIncome ? randInt(2800, 5200) : baseAmount,
        paymentMode: pick(PAYMENT_MODES),
        date: daysAgo(randInt(0, 120)),
        tags: Math.random() < 0.2 ? ['recurring'] : [],
        note: '',
      }),
    )
  }
  return rows
}

function generateBudgets(userId) {
  return CATEGORIES.slice(0, 8).map((category) =>
    db.budgets.insertOne({
      userId,
      category,
      monthlyLimit: {
        Groceries: 500,
        Rent: 1800,
        Dining: 250,
        Transport: 180,
        Utilities: 300,
        Entertainment: 150,
        Shopping: 400,
        Healthcare: 200,
      }[category],
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
    }),
  )
}

function generateFraudRecords(userId) {
  const flagged = [
    { merchant: 'Unknown POS - Lagos', location: 'Lagos, NG', device: 'Unrecognized Device', risk: 0.91 },
    { merchant: 'QuickCash ATM', location: 'Newark, NJ', device: 'New Device', risk: 0.62 },
    { merchant: 'Global Electronics Ltd', location: 'Hong Kong', device: 'Unrecognized Device', risk: 0.78 },
  ]
  return flagged.map((f) =>
    db.fraudRecords.insertOne({
      userId,
      merchant: f.merchant,
      amount: randInt(150, 2200),
      location: f.location,
      device: f.device,
      time: daysAgo(randInt(0, 14)),
      riskScore: f.risk,
      status: f.risk > 0.8 ? 'flagged' : 'under_review',
    }),
  )
}

function generateInvestments(userId) {
  return [
    { asset: 'Index Fund - S&P 500', type: 'Mutual Fund', amount: 4200, returnPct: 8.4 },
    { asset: 'Gov Bond 10Y', type: 'Bonds', amount: 1500, returnPct: 4.1 },
    { asset: 'Gold ETF', type: 'Gold', amount: 900, returnPct: 5.6 },
    { asset: 'Emergency Fund', type: 'FD', amount: 3000, returnPct: 3.2 },
  ].map((inv) => db.investments.insertOne({ userId, ...inv }))
}

function generateLoans(userId) {
  return [
    db.loans.insertOne({
      userId,
      type: 'Auto Loan',
      amount: 18000,
      status: 'active',
      emi: 420,
      interestRate: 6.5,
      termMonths: 48,
    }),
  ]
}

function generateCreditReport(userId) {
  return db.creditReports.insertOne({
    userId,
    score: 712,
    riskLevel: 'Low',
    utilization: 0.28,
    onTimePaymentRate: 0.97,
    generatedAt: daysAgo(3),
  })
}

export function seedUserData(userId) {
  generateTransactions(userId)
  generateBudgets(userId)
  generateFraudRecords(userId)
  generateInvestments(userId)
  generateLoans(userId)
  generateCreditReport(userId)
}
