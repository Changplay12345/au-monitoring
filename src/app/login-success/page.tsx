'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function LoginSuccessPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Start the success animation after a short delay
    setTimeout(() => setShowSuccess(true), 500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Success transition overlay - this is what appears during login */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
          showSuccess ? 'opacity-100' : 'opacity-0'
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

      {/* Instructions */}
      <div className="absolute top-8 left-8 bg-white rounded-lg shadow-lg p-6 max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-2">Login Success Animation</h3>
        <p className="text-sm text-gray-600 mb-4">
          This is the animation that appears when you successfully log in. It normally shows for 1.5 seconds before redirecting.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Login
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
