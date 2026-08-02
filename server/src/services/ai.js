/**
 * Mock "AI" logic. Every function here is a pure function with a stable
 * signature so it can be swapped for a real model or LLM call later without
 * touching routes or the frontend that consumes them.
 */

export function predictCreditScore(input) {
  const { age, income, debt, emi, utilization, historyYears, openLoans } = input

  let score = 550
  score += Math.min(income / 1000, 120)
  score -= Math.min((debt / Math.max(income, 1)) * 100, 150)
  score -= utilization * 150
  score += Math.min(historyYears * 8, 100)
  score -= openLoans * 15
  score -= (emi / Math.max(income, 1)) * 80
  score += age >= 25 ? 20 : 0
  score = Math.max(300, Math.min(900, Math.round(score)))

  const riskLevel = score >= 750 ? 'Low' : score >= 650 ? 'Moderate' : score >= 550 ? 'High' : 'Very High'

  const reasons = []
  if (utilization > 0.5) reasons.push('Credit utilization is above the recommended 30% threshold')
  if (emi / Math.max(income, 1) > 0.4) reasons.push('EMI-to-income ratio is high')
  if (historyYears < 2) reasons.push('Limited credit history')
  if (openLoans > 2) reasons.push('Multiple open loans increase risk')
  if (reasons.length === 0) reasons.push('Healthy balance across income, debt, and repayment history')

  const tips = [
    utilization > 0.3 ? 'Pay down revolving balances to bring utilization under 30%' : null,
    emi / Math.max(income, 1) > 0.3 ? 'Avoid new EMIs until existing ones are reduced' : null,
    historyYears < 3 ? 'Keep older credit lines open to lengthen your credit history' : null,
    'Continue making on-time payments — payment history has the largest impact on your score',
  ].filter(Boolean)

  return { score, riskLevel, reasons, tips }
}

export function checkLoanEligibility(input) {
  const { salary, existingLoanEmi, creditScore, age, employmentType } = input

  const disposableIncome = salary - existingLoanEmi
  const emiToIncome = existingLoanEmi / Math.max(salary, 1)

  let eligible = creditScore >= 600 && emiToIncome < 0.5 && age >= 21 && age <= 60
  let probability = 0.5
  probability += (creditScore - 600) / 600
  probability -= emiToIncome
  probability += employmentType === 'Salaried' ? 0.1 : 0
  probability = Math.max(0.02, Math.min(0.98, probability))

  const maxLoanAmount = eligible ? Math.round(disposableIncome * 24) : 0
  const interestRate = creditScore >= 750 ? 8.5 : creditScore >= 650 ? 10.5 : 13.5
  const termMonths = 60
  const monthlyRate = interestRate / 1200
  const estimatedEmi = eligible
    ? Math.round(
        (maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1),
      )
    : 0

  const reasons = []
  if (creditScore < 600) reasons.push('Credit score is below the minimum threshold of 600')
  if (emiToIncome >= 0.5) reasons.push('Existing EMI obligations are too high relative to income')
  if (age < 21 || age > 60) reasons.push('Age is outside the eligible lending range')
  if (eligible) reasons.push('Income, credit score, and existing obligations meet lending criteria')

  return {
    eligible,
    probability: Math.round(probability * 100) / 100,
    maxLoanAmount,
    interestRate,
    estimatedEmi,
    termMonths,
    reasons,
    recommendations: eligible
      ? ['Consider a shorter term to reduce total interest paid']
      : ['Reduce existing EMI load before reapplying', 'Improving your credit score by 50+ points will materially help'],
  }
}

export function scoreFraudTransaction(txn) {
  let risk = 0.05
  if (txn.location && /Lagos|Hong Kong|unknown/i.test(txn.location)) risk += 0.4
  if (txn.device && /unrecognized|new device/i.test(txn.device)) risk += 0.3
  if (txn.amount > 1000) risk += 0.15
  const hour = new Date(txn.time || Date.now()).getHours()
  if (hour < 5 || hour > 23) risk += 0.1
  risk = Math.min(0.98, risk)

  return {
    riskScore: Math.round(risk * 100) / 100,
    status: risk > 0.7 ? 'flagged' : risk > 0.4 ? 'under_review' : 'clear',
  }
}

export function recommendInvestment(input) {
  const { riskTolerance, age, goal, durationYears } = input

  const profiles = {
    Conservative: { stocks: 15, mutualFunds: 20, gold: 15, fd: 35, bonds: 10, emergencyFund: 5 },
    Moderate: { stocks: 35, mutualFunds: 30, gold: 10, fd: 15, bonds: 5, emergencyFund: 5 },
    Aggressive: { stocks: 55, mutualFunds: 30, gold: 5, fd: 5, bonds: 0, emergencyFund: 5 },
  }
  const allocation = profiles[riskTolerance] || profiles.Moderate

  const expectedReturnByTolerance = { Conservative: 7, Moderate: 10, Aggressive: 13 }
  const expectedAnnualReturn = expectedReturnByTolerance[riskTolerance] || 10

  return {
    allocation,
    expectedAnnualReturn,
    riskLevel: riskTolerance,
    projection: {
      durationYears,
      note: `At an estimated ${expectedAnnualReturn}% annual return, consistent investing toward "${goal}" over ${durationYears} years compounds significantly — actual returns will vary with market conditions.`,
    },
    suitableFor: `Age ${age}, ${durationYears}-year horizon, ${riskTolerance.toLowerCase()} risk tolerance`,
  }
}

export function generateInsights(transactions) {
  const byCategory = {}
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const insights = []

  if (sorted.length) {
    const [topCategory, topAmount] = sorted[0]
    insights.push({
      type: 'spend_alert',
      title: `${topCategory} is your top expense`,
      detail: `You've spent $${topAmount.toFixed(0)} on ${topCategory} recently — consider setting a budget if this feels high.`,
    })
  }
  if (sorted.length > 1) {
    const [secondCategory] = sorted[1]
    insights.push({
      type: 'suggestion',
      title: `Trim ${secondCategory} spending`,
      detail: `A 10% cut to ${secondCategory} could free up meaningful savings each month.`,
    })
  }
  insights.push({
    type: 'tip',
    title: 'Automate your savings',
    detail: 'Setting up an automatic transfer on payday makes saving consistent instead of optional.',
  })

  return insights
}

const INTENT_RESPONSES = [
  {
    keywords: ['reduce', 'lower', 'cut', 'expense', 'spending'],
    reply:
      'Start with your top 2 spending categories — even a 10-15% trim there usually outweighs cutting many small categories. Want me to break down your biggest categories?',
  },
  {
    keywords: ['invest', 'mutual fund', 'stock'],
    reply:
      'It depends on your timeline and risk tolerance. For most people, a mix of low-cost index funds plus a smaller allocation to individual stocks works well. Check the Investment Advisor page for a personalized allocation.',
  },
  {
    keywords: ['credit score', 'credit'],
    reply:
      'The biggest levers for your credit score are on-time payments and keeping credit utilization under 30%. Head to the Credit Score page to see your current prediction and specific tips.',
  },
  {
    keywords: ['loan', 'eligib'],
    reply:
      'Loan eligibility mainly comes down to your credit score, income, and existing EMI load. Try the Loan Eligibility calculator for an instant estimate.',
  },
  {
    keywords: ['budget'],
    reply:
      'A simple 50/30/20 split (needs / wants / savings) is a solid starting point. You can set category budgets on the Budget Planner page and I\'ll flag overspending as it happens.',
  },
  {
    keywords: ['fraud', 'suspicious'],
    reply:
      'I continuously score your transactions for unusual location, device, and amount patterns. Check the Fraud Detection page for anything currently flagged.',
  },
]

export function chatbotReply(message) {
  const lower = message.toLowerCase()
  const match = INTENT_RESPONSES.find((r) => r.keywords.some((k) => lower.includes(k)))
  if (match) return match.reply
  return "I can help with spending, budgeting, credit score, loans, investments, and fraud alerts. Try asking something like \"How can I reduce expenses?\""
}
