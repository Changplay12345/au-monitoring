'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, User, Lock, LogOut } from 'lucide-react'
import DustBackground from "@/components/BackGroundAnimated";

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading } = useAuth()
  const isLogoutPage = searchParams.get('logout') === 'true'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showLogoutMessage, setShowLogoutMessage] = useState(false)

  // Entrance animation
  useEffect(() => {
    setMounted(true)
    // Check if user just logged out
    if (searchParams.get('logout') === 'true') {
      setShowLogoutMessage(true)
      setTimeout(() => setShowLogoutMessage(false), 3000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    // Get redirect URL from query params
    const redirectTo = searchParams.get('redirect') || '/home'
    
    const result = await login(username, password, redirectTo)
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        setError(error.message)
        return
      }
      
      if (data.url) {
        // Open OAuth provider in popup window
        const popup = window.open(
          data.url,
          'oauth-login',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        if (!popup) {
          setError('Popup blocked. Please allow popups and try again.')
          return
        }
        
        // Listen for popup close or success message
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            // Check if user is logged in after popup closes
            window.location.reload()
          }
        }, 1000)
        
        // Listen for messages from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin === window.location.origin) {
            if (event.data === 'oauth-success') {
              clearInterval(checkClosed)
              popup.close()
              window.location.reload()
            }
          }
        }
        
        window.addEventListener('message', messageHandler)
        
        // Clean up after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          if (!popup.closed) {
            popup.close()
          }
        }, 300000)
      }
    } catch (err) {
      setError('Failed to initialize OAuth login')
    }
  }

  return (
    <>
      {/* Signing in animation overlay */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 transition-all duration-500 ${
          isLoading && !isLogoutPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`text-center transform transition-all duration-500 ${
          isLoading ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          {/* Animated logo */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse" />
            <img
              src="https://upload.wikimedia.org/wikipedia/en/5/50/Assumption_University_of_Thailand_%28logo%29.png"
              alt="AU Logo"
              className="w-24 h-24 object-contain relative z-10 animate-pulse"
            />
          </div>
          {/* Loading spinner */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Signing you in...</h2>
          <p className="text-gray-500 text-sm">Please wait a moment</p>
        </div>
      </div>

      
      {/* Background layer */}
      <div className="fixed inset-0 bg-gray-100 -z-10" />
      <DustBackground/>
      {/* Modern background with subtle red accent */}
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8">
        
        {/* Centered container with max-width for zoomed-out effect */}
        <div 
          className={`w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ease-out relative z-10 ${
            mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          {/* Left side - Brand/Imagery */}
          <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-2xl">
            {/* Background image - using local asset */}
            <img 
              src="/login1.webp"
              alt="Assumption University Campus"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle dark gradient overlay for text readability */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.4) 100%)'
              }}
            />
            {/* Text overlay - top left */}
            <div className="absolute top-0 left-0 p-10 z-10">
              <h1 
                className="text-3xl xl:text-4xl font-light tracking-wide text-white font-[var(--font-inter)]"
                style={{ 
                  textShadow: '0 2px 10px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)'
                }}
              >
                Assumption University
              </h1>
              <p 
                className="text-lg xl:text-xl text-white/90 font-light mt-1 font-[var(--font-inter)]"
                style={{ 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                of Thailand
              </p>
            </div>
          </aside>

          {/* Right side - Login Form */}
          <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-white lg:rounded-r-2xl">
            <div className="w-full max-w-md">
              {/* Card content */}
              <div>
              {/* Logout message - absolute positioned to not affect layout */}
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm shadow-lg transition-all duration-300 ${
                showLogoutMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}>
                <LogOut className="w-4 h-4" />
                You have been signed out successfully
              </div>

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/5/50/Assumption_University_of_Thailand_%28logo%29.png"
                  alt="AU Logo"
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                  Welcome to <span className="text-red-700 font-bold">AU-Monitoring</span>
                </h2>
                <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username or Email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <a href="/forgot-password" className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSuccess 
                      ? 'bg-green-600' 
                      : 'bg-red-700 hover:bg-red-800 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Success!
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Divider - Or continue with */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('facebook')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </button>
              </div>

              {/* Divider - New to AU-Monitoring */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to AU-Monitoring?</span>
                </div>
              </div>

              {/* Register link */}
              <a 
                href="/register" 
                className="block w-full py-3 px-4 rounded-md font-semibold text-red-700 border-2 border-red-700 text-center hover:bg-red-50 transition-all duration-200 active:scale-[0.98]"
              >
                Create an account
              </a>
              </div>
            </div>
          </main>
        </div>
      </div>

          </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
