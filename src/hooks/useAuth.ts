'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, AuthState } from '@/lib/types'
import { 
  loginUser as authLogin, 
  getUserSession, 
  storeUserSession, 
  clearUserSession 
} from '@/lib/auth'

// Sync interval in milliseconds (check every 10 seconds)
const SYNC_INTERVAL = 10000

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync user data from database (for real-time role updates)
  const syncUserData = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/user/sync?userId=${userId}`)
      if (!response.ok) {
        // User might have been deleted
        if (response.status === 404) {
          clearUserSession()
          setState({ user: null, isLoading: false, isAuthenticated: false })
          router.push('/login?reason=account_deleted')
          return
        }
        return
      }
      
      const { user: freshUser } = await response.json()
      const currentUser = getUserSession()
      
      if (currentUser && freshUser) {
        // Check if role or other important data changed
        if (currentUser.role !== freshUser.role || 
            currentUser.name !== freshUser.name ||
            currentUser.email !== freshUser.email) {
          // Update local session with fresh data
          storeUserSession(freshUser)
          setState(prev => ({
            ...prev,
            user: freshUser,
          }))
          console.log('[useAuth] User data synced - role:', freshUser.role)
        }
      }
    } catch (error) {
      console.error('[useAuth] Sync error:', error)
    }
  }, [router])

  // Check session on mount and start sync interval
  useEffect(() => {
    try {
      const user = getUserSession()
      setState({
        user,
        isLoading: false,
        isAuthenticated: user !== null,
      })
      
      // Start periodic sync if user is logged in
      if (user) {
        // Initial sync
        syncUserData(user.id)
        
        // Set up interval for periodic sync
        syncIntervalRef.current = setInterval(() => {
          const currentUser = getUserSession()
          if (currentUser) {
            syncUserData(currentUser.id)
          }
        }, SYNC_INTERVAL)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
    
    // Cleanup interval on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncUserData])

  // Login function with redirect support
  const login = useCallback(async (username: string, password: string, redirectTo?: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const user = await authLogin(username, password)
      storeUserSession(user)
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
      
      // Redirect to the requested page or default to /home
      const destination = redirectTo || '/home'
      router.push(destination)
      return { success: true, user }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }, [router])

  // Logout function with animation
  const logout = useCallback(() => {
    setIsLoggingOut(true)
    
    // Delay actual logout to show animation
    setTimeout(() => {
      clearUserSession()
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/login?logout=true')
    }, 800)
  }, [router])

  // Require authentication (redirect if not logged in)
  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/login')
    }
  }, [state.isLoading, state.isAuthenticated, router])

  return {
    ...state,
    login,
    logout,
    requireAuth,
    isLoggingOut,
  }
}
