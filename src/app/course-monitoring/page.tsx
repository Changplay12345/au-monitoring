'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { CourseGrid } from '@/components/CourseGrid'
import { GCPLayout } from '@/components/GCPLayout'
import DustBackgroundLight from '@/components/BackGroundAnimatedLight'

export default function CourseMonitoringPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DustBackgroundLight particleMultiplier={0.5} />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DustBackgroundLight particleMultiplier={0.5} />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <>
      <DustBackgroundLight particleMultiplier={0.5} />
      <GCPLayout activeFeature="Course Monitoring" projectName="Course Monitoring">
        <CourseGrid />
      </GCPLayout>
    </>
  )
}
