'use client'

import { useState, useEffect } from 'react'
import { cn } from './utils'
import { Loader2 } from 'lucide-react'

interface PageTransitionProps {
  isNavigating: boolean
  targetPage?: string
}

export function PageTransition({ isNavigating, targetPage }: PageTransitionProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isNavigating) {
      setShow(true)
    }
  }, [isNavigating])

  if (!show) return null

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-white",
        "transition-opacity duration-300",
        isNavigating ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold text-red-600 tracking-tight">AU</span>
          <span className="text-3xl font-light text-gray-700">USR&MP</span>
        </div>
        
        {/* Loading spinner */}
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        
        {/* Target page text */}
        {targetPage && (
          <p className="text-sm text-gray-500 animate-pulse">
            Loading {targetPage}...
          </p>
        )}
      </div>
    </div>
  )
}
