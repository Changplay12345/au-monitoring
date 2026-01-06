'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RootPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      router.push('/home')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  )
}
