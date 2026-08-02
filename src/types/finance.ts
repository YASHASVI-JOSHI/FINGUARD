export type TransactionType = 'income' | 'expense'

export interface Transaction {
  _id: string
  userId: string
  type: TransactionType
  category: string
  merchant: string
  amount: number
  paymentMode: string
  date: string
  tags: string[]
  note: string
  createdAt: string
}

export interface Budget {
  _id: string
  userId: string
  category: string
  monthlyLimit: number
  period: string
  createdAt: string
}

export const EXPENSE_CATEGORIES = [
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
  'Other',
]

export const PAYMENT_MODES = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash']
