import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Loader2, MailCheck } from 'lucide-react'
import { AuthShell } from './Login'

interface ForgotForm {
  email: string
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>()

  async function onSubmit(_data: ForgotForm) {
    // TODO Phase 1: replace with real POST /api/auth/forgot-password
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-card">
            <MailCheck className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-xl font-bold text-text">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted">
            If an account exists for that email, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="mt-6 text-sm font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-text">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we'll send you a link to get back in.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
          <input
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
