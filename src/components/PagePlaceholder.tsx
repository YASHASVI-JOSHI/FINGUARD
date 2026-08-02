import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  phase: string
}

export default function PagePlaceholder({ icon: Icon, title, description, phase }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-white/5 bg-surface/50 px-8 py-16 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-glow">
        <Icon className="h-8 w-8 text-accent" />
      </div>
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      <span className="mt-6 rounded-full border border-white/10 bg-card px-4 py-1.5 text-xs font-medium text-muted">
        Wired up in {phase}
      </span>
    </motion.div>
  )
}
