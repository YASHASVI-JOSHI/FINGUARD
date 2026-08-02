export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short' })
}

export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export function isInPeriod(iso: string, period: string): boolean {
  return iso.slice(0, 7) === period
}

export function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}
