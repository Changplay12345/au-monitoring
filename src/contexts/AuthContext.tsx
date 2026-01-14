'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserById, getUserByUsername, User } from '@/lib/userService'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session) {
        const { success, user: userData } = await getUserById(session.user.id)
        if (success && userData) {
          setUser(userData)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session) {
          const { success, user: userData } = await getUserById(session.user.id)
          if (success && userData) {
            setUser(userData)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const { success, user: userRecord, error } = await getUserByUsername(username)

      if (!success || !userRecord?.email) {
        return { success: false, error: 'Invalid username or password' }
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password,
      })

      if (signInError) {
        return { 
          success: false, 
          error: signInError.message.includes('Invalid login credentials') 
            ? 'Invalid username or password' 
            : signInError.message 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
