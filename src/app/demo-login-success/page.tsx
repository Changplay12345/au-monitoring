'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export default function DemoLoginSuccessPage() {
  const [showAnimation, setShowAnimation] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  useEffect(() => {
    // Start animation after 1 second
    const timer = setTimeout(() => {
      setShowAnimation(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleRestart = () => {
    setShowAnimation(false)
    setRestartKey(prev => prev + 1)
    setTimeout(() => setShowAnimation(true), 500)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* This is the exact login success animation from login page */}
      <div 
        key={restartKey}
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
          showAnimation ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: showAnimation ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)' : 'transparent'
        }}
      >
        <div className={`text-center transform transition-all duration-700 ${
          showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
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

      {/* Simple restart button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          Replay Animation
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
