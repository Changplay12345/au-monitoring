'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: 'admin' | 'user'
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && user.role !== requiredRole) {
      // Redirect non-admin users trying to access admin routes
      if (requiredRole === 'admin' && user.role === 'user') {
        router.push('/home')
        return
      }
    }

    setIsChecking(false)
  }, [user, isAuthenticated, isLoading, router, requiredRole])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
