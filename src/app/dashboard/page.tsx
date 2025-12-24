'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CourseGrid } from '@/components/CourseGrid'
import { LogOut, BookOpen, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewType = 'schedule' | 'dashboard'

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout, requireAuth } = useAuth()
  const [view, setView] = useState<ViewType>('schedule')

  // Require authentication
  useEffect(() => {
    if (!isLoading) {
      requireAuth()
    }
  }, [isLoading, requireAuth])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  // Not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[auto_1fr]">
      {/* Left sidebar/header */}
      <aside className="bg-red-600 flex lg:flex-col items-center gap-3 p-3 lg:p-4">
        <img
          src="https://upload.wikimedia.org/wikipedia/en/5/50/Assumption_University_of_Thailand_%28logo%29.png"
          alt="AU Logo"
          className="w-16 lg:w-20 h-auto"
        />
        <h1 className="text-white font-bold text-lg lg:text-xl lg:text-center">
          Assumption University of Thailand
        </h1>
      </aside>

      {/* Main content */}
      <main className="bg-gray-50">
        {/* App bar */}
        <div className="sticky top-0 z-50 flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('schedule')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors',
                view === 'schedule'
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
            >
              <BookOpen className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors',
                view === 'dashboard'
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Course Registration
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">
              Hi, {user.name || user.username || user.email || 'Student'}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {view === 'schedule' ? (
            <CourseGrid />
          ) : (
            <DashboardContent user={user} />
          )}
        </div>
      </main>
    </div>
  )
}

// Dashboard content component
function DashboardContent({ user }: { user: { name: string | null; email: string } }) {
  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Welcome {user.name || 'Student'} to Course Register
        </h2>
        <p className="text-gray-600 mb-4">
          Click to test the email and send the registration details to:{' '}
          <strong>{user.email}</strong>
        </p>
        <button className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
          Register class (to test email)
        </button>
        <p className="mt-4 text-sm text-gray-500">
          This feature will send a test email to your registered email address.
        </p>
      </div>
    </div>
  )
}
