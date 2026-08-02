import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'warning'
  delay?: number
}

const TONE_CLASSES: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
}

export default function StatCard({ icon: Icon, label, value, tone = 'default', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-white/5 bg-surface p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <Icon className={`h-4.5 w-4.5 ${TONE_CLASSES[tone]}`} />
      </div>
      <p className="mt-3 text-2xl font-bold text-text">{value}</p>
    </motion.div>
  )
}
