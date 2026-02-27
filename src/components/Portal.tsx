'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  containerId?: string
}

export function Portal({ children, containerId = 'modal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [, forceUpdate] = useState(0)

  // Create container element once and keep reference
  const getContainer = useCallback(() => {
    if (typeof document === 'undefined') return null
    
    // If we already have a valid container, return it
    if (containerRef.current && document.body.contains(containerRef.current)) {
      return containerRef.current
    }
    
    // Try to find existing container
    let element = document.getElementById(containerId) as HTMLDivElement | null
    
    if (!element) {
      // Create new container
      element = document.createElement('div')
      element.id = containerId
      document.body.appendChild(element)
    }
    
    containerRef.current = element
    return element
  }, [containerId])

  useEffect(() => {
    const container = getContainer()
    if (container) {
      setMounted(true)
    }

    // Cleanup: don't remove the container, just clear our ref
    return () => {
      containerRef.current = null
    }
  }, [getContainer])

  // Safety check before rendering
  if (!mounted) {
    return null
  }

  const container = getContainer()
  if (!container || !document.body.contains(container)) {
    return null
  }

  try {
    return createPortal(children, container)
  } catch (error) {
    // If portal fails, return null to prevent crash
    console.warn('Portal render failed:', error)
    return null
  }
}
