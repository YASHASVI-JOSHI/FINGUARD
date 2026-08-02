import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from './Login'

interface SignupForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>()

  async function onSubmit(data: SignupForm) {
    setServerError(null)
    try {
      await signup(data.name, data.email, data.password)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not create your account. Please try again.')
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-text">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Full name</label>
          <input
            className="auth-input"
            placeholder="Jane Doe"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>}
        </div>

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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Confirm password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
