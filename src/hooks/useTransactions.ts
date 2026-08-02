import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Transaction } from '../types/finance'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ transactions: Transaction[] }>('/transactions')
      setTransactions(res.transactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addTransaction(input: {
    category: string
    merchant: string
    amount: number
    paymentMode: string
    date: string
    type: 'income' | 'expense'
    note?: string
  }) {
    const res = await api.post<{ transaction: Transaction }>('/transactions', input)
    setTransactions((prev) => [res.transaction, ...prev])
  }

  async function updateTransaction(id: string, patch: Partial<Transaction>) {
    const res = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, patch)
    setTransactions((prev) => prev.map((t) => (t._id === id ? res.transaction : t)))
  }

  async function deleteTransaction(id: string) {
    await api.delete(`/transactions/${id}`)
    setTransactions((prev) => prev.filter((t) => t._id !== id))
  }

  return { transactions, isLoading, error, refresh, addTransaction, updateTransaction, deleteTransaction }
}
