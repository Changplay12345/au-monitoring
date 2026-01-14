'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface PageVisibilityContextType {
  hiddenPages: Set<string>
  fullyHiddenPages: Set<string>
  isPageHidden: (pageId: string) => boolean
  isPageFullyHidden: (pageId: string) => boolean
  togglePageVisibility: (pageId: string) => Promise<void>
  toggleFullyHidden: (pageId: string) => Promise<void>
  refreshVisibility: () => Promise<void>
  isAdmin: boolean
  showLockedPopup: boolean
  lockedPageName: string
  dismissLockedPopup: () => void
  isInitialized: boolean
}

const PageVisibilityContext = createContext<PageVisibilityContextType | null>(null)

// Map of page paths to page IDs
const PAGE_ID_MAP: Record<string, string> = {
  '/home': 'Home Page',
  '/project-overview': 'Project Overview',
  '/documentation': 'Documentation',
  '/tqf-desktop': 'TQF Master 2.0 Desktop',
  '/course-monitoring': 'Course Monitoring',
  '/tqf-master': 'TQF Master 2.0',
  '/registration-simulator': 'Registration Simulator',
  '/apis-services': 'APIs & Services',
  '/admin-panel': 'Admin Panel',
}

export function PageVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hiddenPages, setHiddenPages] = useState<Set<string>>(new Set())
  const [fullyHiddenPages, setFullyHiddenPages] = useState<Set<string>>(new Set())
  const [lastTimestamp, setLastTimestamp] = useState<number>(0)
  const [showLockedPopup, setShowLockedPopup] = useState(false)
  const [lockedPageName, setLockedPageName] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'
  const kickedRef = useRef(false)

  const dismissLockedPopup = useCallback(() => {
    setShowLockedPopup(false)
    setLockedPageName('')
  }, [])

  // Fetch hidden pages from API
  const refreshVisibility = useCallback(async () => {
    try {
      const response = await fetch('/api/page-visibility')
      const data = await response.json()
      
      if (data.success) {
        const newHiddenPages = new Set<string>(data.hiddenPages || [])
        const newFullyHiddenPages = new Set<string>(data.fullyHiddenPages || [])
        setHiddenPages(newHiddenPages)
        setFullyHiddenPages(newFullyHiddenPages)
        
        // Mark as initialized after first fetch
        if (!isInitialized) {
          setIsInitialized(true)
        }
        
        // Check if current page was just hidden/fully hidden
        if (data.timestamp > lastTimestamp && lastTimestamp > 0) {
          const currentPageId = PAGE_ID_MAP[pathname]
          // Fully hidden kicks everyone including admin
          if (currentPageId && newFullyHiddenPages.has(currentPageId) && !kickedRef.current) {
            kickedRef.current = true
            setLockedPageName(currentPageId)
            setShowLockedPopup(true)
            setTimeout(() => {
              router.push('/home')
              kickedRef.current = false
            }, 2000)
          }
          // Regular hidden only kicks non-admins
          else if (currentPageId && newHiddenPages.has(currentPageId) && !isAdmin && !kickedRef.current) {
            kickedRef.current = true
            setLockedPageName(currentPageId)
            setShowLockedPopup(true)
            setTimeout(() => {
              router.push('/home')
              kickedRef.current = false
            }, 2000)
          }
        }
        
        setLastTimestamp(data.timestamp)
      }
    } catch (error) {
      console.error('Failed to fetch page visibility:', error)
    }
  }, [pathname, isAdmin, lastTimestamp, router])

  // Toggle page visibility (admin only)
  const togglePageVisibility = useCallback(async (pageId: string) => {
    if (!isAdmin) return

    const isCurrentlyHidden = hiddenPages.has(pageId)
    
    try {
      const response = await fetch('/api/page-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          isHidden: !isCurrentlyHidden
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setHiddenPages(new Set(data.hiddenPages))
        setLastTimestamp(data.timestamp)
      }
    } catch (error) {
      console.error('Failed to toggle page visibility:', error)
    }
  }, [isAdmin, hiddenPages])

  // Check if a page is hidden
  const isPageHidden = useCallback((pageId: string) => {
    return hiddenPages.has(pageId)
  }, [hiddenPages])

  // Check if a page is fully hidden (from everyone including admin)
  const isPageFullyHidden = useCallback((pageId: string) => {
    return fullyHiddenPages.has(pageId)
  }, [fullyHiddenPages])

  // Toggle fully hidden (hides from everyone including admin)
  const toggleFullyHidden = useCallback(async (pageId: string) => {
    if (!isAdmin) return

    const isCurrentlyFullyHidden = fullyHiddenPages.has(pageId)
    
    try {
      const response = await fetch('/api/page-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          isFullyHidden: !isCurrentlyFullyHidden
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setHiddenPages(new Set(data.hiddenPages || []))
        setFullyHiddenPages(new Set(data.fullyHiddenPages || []))
        setLastTimestamp(data.timestamp)
      }
    } catch (error) {
      console.error('Failed to toggle fully hidden:', error)
    }
  }, [isAdmin, fullyHiddenPages])

  // Poll for visibility changes every 2 seconds
  useEffect(() => {
    refreshVisibility()
    
    const interval = setInterval(() => {
      refreshVisibility()
    }, 2000)

    return () => clearInterval(interval)
  }, [refreshVisibility])

  // Check if user is on a hidden page on mount/navigation
  useEffect(() => {
    // Wait for initialization before checking
    if (!isInitialized) return
    
    const currentPageId = PAGE_ID_MAP[pathname]
    if (!currentPageId) return
    
    // Fully hidden kicks everyone
    if (fullyHiddenPages.has(currentPageId) && !kickedRef.current) {
      kickedRef.current = true
      setLockedPageName(currentPageId)
      setShowLockedPopup(true)
      setTimeout(() => {
        router.push('/home')
        kickedRef.current = false
      }, 2000)
    }
    // Regular hidden only kicks non-admins
    else if (!isAdmin && hiddenPages.has(currentPageId) && !kickedRef.current) {
      kickedRef.current = true
      setLockedPageName(currentPageId)
      setShowLockedPopup(true)
      setTimeout(() => {
        router.push('/home')
        kickedRef.current = false
      }, 2000)
    }
  }, [pathname, hiddenPages, fullyHiddenPages, isAdmin, router, isInitialized])

  return (
    <PageVisibilityContext.Provider value={{
      hiddenPages,
      fullyHiddenPages,
      isPageHidden,
      isPageFullyHidden,
      togglePageVisibility,
      toggleFullyHidden,
      refreshVisibility,
      isAdmin,
      showLockedPopup,
      lockedPageName,
      dismissLockedPopup,
      isInitialized
    }}>
      {children}
    </PageVisibilityContext.Provider>
  )
}

export function usePageVisibility() {
  const context = useContext(PageVisibilityContext)
  if (!context) {
    throw new Error('usePageVisibility must be used within a PageVisibilityProvider')
  }
  return context
}

// Export the page ID map for use in other components
export { PAGE_ID_MAP }
