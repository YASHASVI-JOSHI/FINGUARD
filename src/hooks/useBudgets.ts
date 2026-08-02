import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Budget } from '../types/finance'

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ budgets: Budget[] }>('/budgets')
      setBudgets(res.budgets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addBudget(input: { category: string; monthlyLimit: number }) {
    const res = await api.post<{ budget: Budget }>('/budgets', input)
    setBudgets((prev) => [...prev, res.budget])
  }

  async function updateBudget(id: string, patch: Partial<Budget>) {
    const res = await api.put<{ budget: Budget }>(`/budgets/${id}`, patch)
    setBudgets((prev) => prev.map((b) => (b._id === id ? res.budget : b)))
  }

  async function deleteBudget(id: string) {
    await api.delete(`/budgets/${id}`)
    setBudgets((prev) => prev.filter((b) => b._id !== id))
  }

  return { budgets, isLoading, error, refresh, addBudget, updateBudget, deleteBudget }
}
