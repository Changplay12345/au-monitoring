'use client'

import { usePageVisibility } from '@/contexts/PageVisibilityContext'
import { Lock, AlertTriangle } from 'lucide-react'

export function LockedPagePopup() {
  const { showLockedPopup, lockedPageName, dismissLockedPopup } = usePageVisibility()

  if (!showLockedPopup) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Page Locked</h2>
          <p className="text-red-100">Access Restricted</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Administrator Action</span>
          </div>
          
          <p className="text-gray-700 mb-2">
            The page <span className="font-semibold text-red-600">"{lockedPageName}"</span> has been locked by an administrator.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You will be redirected to the home page shortly.
          </p>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <p className="text-xs text-gray-400">Redirecting...</p>
        </div>
      </div>
    </div>
  )
}
