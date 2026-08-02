import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ErrorBoundary from '../components/ErrorBoundary'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mx-auto max-w-[1600px] px-6 py-8 md:px-10"
        >
          <ErrorBoundary fullScreen={false}>
            <Outlet />
          </ErrorBoundary>
        </motion.div>
      </main>
    </div>
  )
}
