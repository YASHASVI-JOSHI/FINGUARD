import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  async function onSubmit(data: LoginForm) {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not sign you in. Please try again.')
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-text">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to see where your money stands.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className="auth-input"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            className="auth-input"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
          />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-card accent-primary" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to FinGuard?{' '}
        <Link to="/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.10),transparent_45%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl border border-white/5 bg-surface p-8 shadow-glow"
      >
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-accent" strokeWidth={2.2} />
          <span className="text-lg font-extrabold tracking-tight text-text">FinGuard</span>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
