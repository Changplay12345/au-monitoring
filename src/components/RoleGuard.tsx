'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'
import DustBackground from '@/components/BackGroundAnimated'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: 'admin' | 'user'
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && requiredRole === 'admin' && user.role !== 'admin') {
      setShowAccessDenied(true)
      setTimeout(() => setMounted(true), 100)
      return
    }

    setIsChecking(false)
  }, [user, isAuthenticated, isLoading, router, requiredRole])

  if (isLoading || isChecking) {
    if (showAccessDenied) {
      return (
        <>
          <DustBackground />
          {/* Access Denied Popup - Same style as login signing in animation */}
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 transition-all duration-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className={`text-center transform transition-all duration-500 ${
              mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}>
              {/* Animated icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20" />
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl relative z-10">
                  <ShieldX className="w-12 h-12 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
              <p className="text-gray-500 mb-6 max-w-sm">
                This page requires administrator privileges.<br />
                Please contact an admin if you need access.
              </p>
              
              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </>
      )
    }
    
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
    return fallback || null
  }

  return <>{children}</>
}
