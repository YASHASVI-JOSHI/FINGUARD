export interface User {
  _id: string
  name: string
  email: string
  avatarUrl?: string
  monthlyIncome?: number
  savingsTarget?: number
  financialGoal?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface NavItem {
  label: string
  path: string
  icon: string
}
