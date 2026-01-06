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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
    } else {
      setIsSuccess(true)
      setIsTransitioning(true)
    }
  }

  return (
    <>
      {/* Signing in animation overlay */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 transition-all duration-500 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
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

      {/* Success transition overlay */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
          isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: isTransitioning ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)' : 'transparent'
        }}
      >
        <div className={`text-center transform transition-all duration-700 ${
          isTransitioning ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          {/* Success checkmark with animation */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-green-500 animate-[scale-in_0.5s_ease-out]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome back!</h2>
          <p className="text-white/80 text-lg mb-6">Preparing your dashboard...</p>
          {/* Progress bar */}
          <div className="w-48 h-1.5 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white rounded-full animate-[progress_1.5s_ease-in-out]" />
          </div>
        </div>
      </div>

      {/* Modern background with subtle red accent */}
      <div className={`min-h-screen bg-gray-100 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}> <DustBackground/>
        
        {/* Centered container with max-width for zoomed-out effect */}
        <div 
          className={`w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ease-out ${
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
                  Welcome to <span className="text-red-700 font-bold">AU USR&MP</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
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
                  <a href="#" className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors">
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to AU USR&MP?</span>
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

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
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
