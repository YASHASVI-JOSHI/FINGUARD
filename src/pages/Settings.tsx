import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Bell, Moon, Sun, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '../api/client'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const NOTIFICATION_OPTIONS = [
  { key: 'budgetAlerts', label: 'Budget overspend alerts', description: 'Notify me when a category goes over its limit' },
  { key: 'fraudAlerts', label: 'Fraud alerts', description: 'Notify me immediately about flagged transactions' },
  { key: 'weeklyDigest', label: 'Weekly digest', description: 'A summary of spending and savings every week' },
]

export default function Settings() {
  // Local-only for now — no backend field for these yet, but the UI is fully
  // interactive so wiring persistence later is just an API call away.
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    budgetAlerts: true,
    fraudAlerts: true,
    weeklyDigest: false,
  })
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-muted">Notifications, theme, and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">Notifications</h2>
            </div>
            <div className="space-y-4">
              {NOTIFICATION_OPTIONS.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.description}</p>
                  </div>
                  <Toggle
                    checked={notifications[opt.key]}
                    onChange={(v) => setNotifications((prev) => ({ ...prev, [opt.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Moon className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">Appearance</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'border-accent bg-card text-text' : 'border-white/10 text-muted hover:text-text'
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                disabled
                title="Light theme is coming in a future update"
                className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-muted/50"
              >
                <Sun className="h-4 w-4" /> Light
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted/70">Light theme is on the roadmap — FinGuard is dark-first by design.</p>
          </section>
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-card'}`}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ duration: 0.15 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white"
      />
    </button>
  )
}

function ChangePasswordCard() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>()

  async function onSubmit(data: PasswordForm) {
    setError(null)
    setSuccess(false)
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your password')
    }
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-text">Change password</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Current password</span>
          <input type="password" className="auth-input" {...register('currentPassword', { required: 'Required' })} />
          {errors.currentPassword && <p className="mt-1 text-xs text-danger">{errors.currentPassword.message}</p>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">New password</span>
          <input
            type="password"
            className="auth-input"
            {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'At least 6 characters' } })}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Confirm new password</span>
          <input
            type="password"
            className="auth-input"
            {...register('confirmPassword', {
              required: 'Required',
              validate: (v) => v === watch('newPassword') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>}
        </label>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="auth-submit w-auto px-6">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
          {success && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Updated
            </motion.span>
          )}
        </div>
      </form>
    </section>
  )
}
