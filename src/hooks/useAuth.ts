'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, AuthState } from '@/lib/types'
import { 
  loginUser as authLogin, 
  getUserSession, 
  storeUserSession, 
  clearUserSession 
} from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check session on mount
  useEffect(() => {
    try {
      const user = getUserSession()
      setState({
        user,
        isLoading: false,
        isAuthenticated: user !== null,
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

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
