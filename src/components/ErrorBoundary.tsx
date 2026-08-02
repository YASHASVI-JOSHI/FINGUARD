import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fullScreen?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In a real deployment this is where you'd forward to an error-tracking service
    console.error('FinGuard render error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const fullScreen = this.props.fullScreen ?? true
      return (
        <div
          className={`flex flex-col items-center justify-center gap-4 px-6 text-center ${
            fullScreen ? 'min-h-screen bg-background' : 'min-h-[50vh] rounded-2xl border border-white/5 bg-surface'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-muted">
              This part of FinGuard hit an unexpected error. Try again, or reload the page if it persists.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-blue-500"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
