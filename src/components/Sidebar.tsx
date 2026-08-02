import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Sparkles,
  Gauge,
  Landmark,
  ShieldAlert,
  LineChart,
  MessageCircle,
  UserCircle,
  Settings as SettingsIcon,
  LayoutGrid,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Expense Tracker', path: '/expenses', icon: Receipt },
  { label: 'Budget Planner', path: '/budgets', icon: PiggyBank },
  { label: 'AI Insights', path: '/insights', icon: Sparkles },
  { label: 'Credit Score', path: '/credit-score', icon: Gauge },
  { label: 'Loan Eligibility', path: '/loan-eligibility', icon: Landmark },
  { label: 'Fraud Detection', path: '/fraud-detection', icon: ShieldAlert },
  { label: 'Investment Advisor', path: '/investments', icon: LineChart },
  { label: 'AI Financial Chatbot', path: '/chatbot', icon: MessageCircle },
]

const BOTTOM_ITEMS = [
  { label: 'Profile', path: '/profile', icon: UserCircle },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
  { label: 'Admin', path: '/admin', icon: LayoutGrid },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/5 bg-surface transition-all duration-300 ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      <div className="flex items-center gap-2 px-5 py-6">
        <ShieldCheck className="h-7 w-7 shrink-0 text-accent" strokeWidth={2.2} />
        {!collapsed && (
          <span className="text-lg font-extrabold tracking-tight text-text">FinGuard</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.path} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/5 px-3 py-3">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.path} {...item} collapsed={collapsed} />
        ))}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-danger"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {!collapsed && user && (
        <div className="border-t border-white/5 px-4 py-3 text-xs text-muted truncate">
          Signed in as <span className="text-text">{user.email}</span>
        </div>
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center gap-2 border-t border-white/5 py-3 text-muted transition-colors hover:bg-card hover:text-text"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}

function SidebarLink({
  label,
  path,
  icon: Icon,
  collapsed,
}: {
  label: string
  path: string
  icon: typeof LayoutDashboard
  collapsed: boolean
}) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-card text-text shadow-glow'
            : 'text-muted hover:bg-card/60 hover:text-text'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}
