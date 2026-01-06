'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export default function DemoLoginFlowPage() {
  const [showSigningIn, setShowSigningIn] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  useEffect(() => {
    // Start signing in animation after 1 second
    const timer1 = setTimeout(() => {
      setShowSigningIn(true)
    }, 1000)

    // After 2 seconds of signing in, show success
    const timer2 = setTimeout(() => {
      setShowSigningIn(false)
      setTimeout(() => setShowSuccess(true), 500) // Brief transition
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleRestart = () => {
    setShowSigningIn(false)
    setShowSuccess(false)
    setRestartKey(prev => prev + 1)
    
    // Restart the sequence
    setTimeout(() => setShowSigningIn(true), 1000)
    setTimeout(() => setShowSigningIn(false), 3000)
    setTimeout(() => setShowSuccess(true), 3500)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* 1. Signing in animation */}
      <div 
        key={`signing-${restartKey}`}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 transition-all duration-500 ${
          showSigningIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`text-center transform transition-all duration-500 ${
          showSigningIn ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
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

      {/* 2. Success animation */}
      <div 
        key={`success-${restartKey}`}
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
          showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: showSuccess ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)' : 'transparent'
        }}
      >
        <div className={`text-center transform transition-all duration-700 ${
          showSuccess ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
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

      {/* Restart button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          Replay Full Login Flow
        </button>
      </div>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
