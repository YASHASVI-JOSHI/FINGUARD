import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages are small and needed immediately on first load, so they stay eager.
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'

// Everything behind the protected app shell is lazy-loaded so the initial
// bundle only pays for auth + the shell, not every chart-heavy page.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ExpenseTracker = lazy(() => import('./pages/ExpenseTracker'))
const BudgetPlanner = lazy(() => import('./pages/BudgetPlanner'))
const AIInsights = lazy(() => import('./pages/AIInsights'))
const CreditScore = lazy(() => import('./pages/CreditScore'))
const LoanEligibility = lazy(() => import('./pages/LoanEligibility'))
const FraudDetection = lazy(() => import('./pages/FraudDetection'))
const InvestmentAdvisor = lazy(() => import('./pages/InvestmentAdvisor'))
const Chatbot = lazy(() => import('./pages/Chatbot'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected app shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="expenses"
          element={
            <Suspense fallback={<PageFallback />}>
              <ExpenseTracker />
            </Suspense>
          }
        />
        <Route
          path="budgets"
          element={
            <Suspense fallback={<PageFallback />}>
              <BudgetPlanner />
            </Suspense>
          }
        />
        <Route
          path="insights"
          element={
            <Suspense fallback={<PageFallback />}>
              <AIInsights />
            </Suspense>
          }
        />
        <Route
          path="credit-score"
          element={
            <Suspense fallback={<PageFallback />}>
              <CreditScore />
            </Suspense>
          }
        />
        <Route
          path="loan-eligibility"
          element={
            <Suspense fallback={<PageFallback />}>
              <LoanEligibility />
            </Suspense>
          }
        />
        <Route
          path="fraud-detection"
          element={
            <Suspense fallback={<PageFallback />}>
              <FraudDetection />
            </Suspense>
          }
        />
        <Route
          path="investments"
          element={
            <Suspense fallback={<PageFallback />}>
              <InvestmentAdvisor />
            </Suspense>
          }
        />
        <Route
          path="chatbot"
          element={
            <Suspense fallback={<PageFallback />}>
              <Chatbot />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageFallback />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="admin"
          element={
            <Suspense fallback={<PageFallback />}>
              <AdminDashboard />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  )
}
