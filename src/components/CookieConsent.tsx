'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, CheckCircle } from 'lucide-react'

interface CookieConsentProps {
  onAccept?: () => void
  onReject?: () => void
}

export function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [action, setAction] = useState<'accept' | 'reject' | 'close' | null>(null)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show after a short delay to not interrupt initial loading
      setTimeout(() => setIsVisible(true), 2000)
    }
  }, [])

  const handleAccept = () => {
    setIsAnimating(true)
    setTimeout(() => {
      localStorage.setItem('cookie-consent', 'accepted')
      localStorage.setItem('analytics-consent', 'true')
      setIsVisible(false)
      onAccept?.()
      setIsAnimating(false)
    }, 400)
  }

  const handleReject = () => {
    setAction('reject')
    setIsAnimating(true)
    setTimeout(() => {
      localStorage.setItem('cookie-consent', 'rejected')
      localStorage.setItem('analytics-consent', 'false')
      setIsVisible(false)
      onReject?.()
      setIsAnimating(false)
      setAction(null)
    }, 600)
  }

  const handleClose = () => {
    setAction('close')
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimating(false)
      setAction(null)
    }, 400)
  }

  const handleMinimize = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsMinimized(true)
      setIsAnimating(false)
    }, 300)
  }

  const handleRestore = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsMinimized(false)
      setIsAnimating(false)
    }, 300)
  }

  if (!isVisible) return null

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isAnimating ? 'rotate-12' : 'rotate-0'}`} />
            <span className="text-sm text-gray-600">Cookie Settings</span>
          </div>
          <button
            onClick={handleRestore}
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 hover:scale-105"
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transition-all duration-400 ${
        isVisible && !isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } ${
        action === 'reject' ? 'bg-red-50 border-red-200' :
        action === 'close' ? 'bg-gray-50 border-gray-300' : ''
      }`}>
      {/* Reject overlay */}
      {action === 'reject' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-10 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-red-600">
            <X className="w-8 h-8 animate-pulse" />
            <span className="font-semibold">Rejected</span>
          </div>
        </div>
      )}

      {/* Close overlay */}
      {action === 'close' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-10 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-gray-600">
            <X className="w-6 h-6 animate-spin" />
            <span className="font-semibold">Closed</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content */}
            <div className={`flex items-start gap-3 flex-1 transition-all duration-300 ${
              isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
            }`}>
              <Cookie className={`w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                action === 'reject' ? 'text-red-600 -rotate-12 scale-110' :
                action === 'close' ? 'text-gray-400 scale-90' :
                'hover:rotate-6'
              }`} />
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
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 transition-all duration-300 ${
              isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
            }`}>
              <button
                onClick={handleMinimize}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-all duration-200 hover:scale-105"
              >
                Later
              </button>
              <button
                onClick={handleReject}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                  action === 'reject' 
                    ? 'bg-red-200 text-red-800 border-2 border-red-400' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {action === 'reject' ? 'Rejected' : 'Reject All'}
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
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
                className="text-red-600 hover:text-red-700 underline transition-colors duration-200 hover:scale-105"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => window.open('/terms', '_blank')}
                className="text-red-600 hover:text-red-700 underline transition-colors duration-200 hover:scale-105"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`absolute top-4 right-4 p-1 transition-all duration-300 hover:scale-110 ${
          action === 'close' 
            ? 'text-gray-600 rotate-90' 
            : 'text-gray-400 hover:text-gray-600 hover:rotate-90'
        }`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
