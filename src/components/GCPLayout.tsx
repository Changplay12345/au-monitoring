'use client'

import { useState, useEffect, useCallback } from 'react'
import { GCPHeader } from './GCPHeader'
import { GCPSidebar } from './GCPSidebar'
import { PageTransition } from './PageTransition'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface GCPLayoutProps {
  children: React.ReactNode
  activeFeature?: string
  projectName?: string
}

export function GCPLayout({ children, activeFeature = 'Course Monitoring', projectName = 'Course Monitoring' }: GCPLayoutProps) {
  const { user, logout, isLoggingOut } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPage, setTargetPage] = useState('')
  const [isEntering, setIsEntering] = useState(true)

  // Entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 100)
    return () => clearTimeout(timer)
  }, [])

  // Toggle sidebar with ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSidebarOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  // Handle navigation to external feature
  const handleNavigate = (url: string, label: string) => {
    setIsNavigating(true)
    setTargetPage(label)
    
    // Delay navigation to show transition
    setTimeout(() => {
      window.location.href = url
    }, 500)
  }

  // Navigate to home page
  const handleLogoClick = () => {
    handleNavigate('/home', 'Home Page')
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-700 ease-out ${
      isEntering ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
    }`}>
      {/* Logout transition overlay */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-500 ${
          isLoggingOut ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`text-center transform transition-all duration-500 ${
          isLoggingOut ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing out...</h2>
          <p className="text-gray-500">See you next time!</p>
        </div>
      </div>

      {/* Page transition overlay */}
      <PageTransition isNavigating={isNavigating} targetPage={targetPage} />

      {/* Header */}
      <GCPHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isSidebarOpen={isSidebarOpen}
        projectName={projectName}
        onLogoClick={handleLogoClick}
        user={user}
        onLogout={logout}
      />

      {/* Sidebar */}
      <GCPSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        activeItem={activeFeature}
        onNavigate={handleNavigate}
      />

      {/* Main content - offset for fixed header */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  )
}
