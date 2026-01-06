'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield } from 'lucide-react'

interface CookieConsentProps {
  onAccept?: () => void
  onReject?: () => void
}

export function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show after a short delay to not interrupt initial loading
      setTimeout(() => setIsVisible(true), 2000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('analytics-consent', 'true')
    setIsVisible(false)
    onAccept?.()
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    localStorage.setItem('analytics-consent', 'false')
    setIsVisible(false)
    onReject?.()
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleRestore = () => {
    setIsMinimized(false)
  }

  if (!isVisible) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Cookie Settings</span>
          </div>
          <button
            onClick={handleRestore}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  We use cookies
                </h3>
                <p className="text-sm text-gray-600 max-w-2xl">
                  We use essential cookies for site functionality and optional cookies for analytics and personalized content. 
                  Your consent helps us improve your experience. You can manage preferences anytime.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <button
                onClick={handleMinimize}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Later
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Accept All
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>Essential cookies: Always active</span>
              <span>•</span>
              <span>Analytics cookies: Track usage</span>
              <span>•</span>
              <button
                onClick={() => window.open('/privacy', '_blank')}
                className="text-red-600 hover:text-red-700 underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => window.open('/terms', '_blank')}
                className="text-red-600 hover:text-red-700 underline"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
