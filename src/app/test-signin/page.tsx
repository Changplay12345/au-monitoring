'use client'

import { useState } from 'react'

export default function TestSignInPage() {
  const [isAnimating, setIsAnimating] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Animation Test</h1>
        <p className="text-gray-600 mb-8">Use this page to adjust the signing in animation</p>
        
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="mb-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          {isAnimating ? 'Stop Animation' : 'Start Animation'}
        </button>

        {/* Signing in animation overlay */}
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 transition-all duration-500 ${
            isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className={`text-center transform transition-all duration-500 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}>
            {/* Animated logo - fixed height container, logo can overflow without affecting layout */}
            <div className="relative h-24 mx-auto mb-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-red-200 animate-ping opacity-20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-red-300 animate-pulse" />
              <img
                src="/au-monitoring-logo2.png"
                alt="AU Monitoring Logo"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-22 w-46 h-46 object-contain rounded-full relative z-10 animate-pulse bg-white"
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

        <div className="mt-8 p-4 bg-white rounded shadow max-w-md mx-auto">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Edit this file at: <code className="bg-gray-100 px-1 rounded">/src/app/test-signin/page.tsx</code></li>
            <li>• Change logo size: Modify <code className="bg-gray-100 px-1 rounded">w-24 h-24</code> on both the container div and img</li>
            <li>• Animation stays on until you click "Stop Animation"</li>
            <li>• After adjusting, copy changes to login page and GCPLayout</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
