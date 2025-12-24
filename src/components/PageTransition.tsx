'use client'

import { Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  isNavigating: boolean
  targetPage?: string
}

export function PageTransition({ isNavigating, targetPage }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isNavigating || !mounted) return null

  // Use portal to render at document body level to ensure it's always on top
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center bg-white"
      style={{ zIndex: 99999 }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Loading spinner */}
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        
        {/* Target page text */}
        {targetPage && (
          <p className="text-sm text-gray-500 animate-pulse">
            Loading {targetPage}...
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}
