'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'

interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
  onChangeDirection?: (direction: 'up' | 'down' | null) => void
}

interface DigitState {
  current: string
  prev: string
  isAnimating: boolean
  animationKey: number
}

export function AnimatedNumber({ value, className = '', duration = 300, onChangeDirection }: AnimatedNumberProps) {
  const [digits, setDigits] = useState<DigitState[]>([])
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const prevValueRef = useRef(value)
  const animationKeyRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Initialize digits on mount
  useEffect(() => {
    if (digits.length === 0) {
      const str = String(value)
      setDigits(str.split('').map((d, i) => ({
        current: d,
        prev: d,
        isAnimating: false,
        animationKey: i,
      })))
    }
  }, [])

  useEffect(() => {
    const oldValue = prevValueRef.current
    const newValue = value
    
    if (oldValue === newValue) return
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Determine direction
    const newDirection = newValue < oldValue ? 'down' : 'up'
    setDirection(newDirection)
    
    // Notify parent of direction change for glow effect
    if (onChangeDirection) {
      console.log('AnimatedNumber onChangeDirection:', newDirection, value)
      onChangeDirection(newDirection)
    }
    
    const oldStr = String(oldValue)
    const newStr = String(newValue)
    
    // Pad to same length
    const maxLen = Math.max(oldStr.length, newStr.length)
    const oldDigits = oldStr.padStart(maxLen, ' ').split('')
    const newDigits = newStr.padStart(maxLen, ' ').split('')
    
    if (prefersReducedMotion) {
      // Skip animation
      setDigits(newDigits.map((d, i) => ({
        current: d,
        prev: d,
        isAnimating: false,
        animationKey: i,
      })))
    } else {
      // Create new digit states - ALL changed digits animate
      const newDigitStates = newDigits.map((d, i) => {
        const changed = d !== oldDigits[i]
        return {
          current: d,
          prev: oldDigits[i],
          isAnimating: changed,
          animationKey: changed ? ++animationKeyRef.current : animationKeyRef.current,
        }
      })
      
      setDigits(newDigitStates)
      
      // End animation after duration
      timeoutRef.current = setTimeout(() => {
        console.log('AnimatedNumber animation ended, calling onChangeDirection(null)')
        setDigits(prev => prev.map(d => ({ ...d, isAnimating: false })))
        if (onChangeDirection) {
          onChangeDirection(null)
        }
      }, duration + 50)
    }
    
    prevValueRef.current = newValue
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, duration, prefersReducedMotion, onChangeDirection])

  return (
    <span 
      className={`inline-flex font-mono tabular-nums items-center ${className}`}
      style={{ 
        lineHeight: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        verticalAlign: 'baseline'
      }}
    >
      {digits.map((digit, index) => (
        <span
          key={index}
          className="relative inline-block overflow-hidden"
          style={{ 
            width: '0.6em',
            height: '1em',
            verticalAlign: 'baseline'
          }}
        >
          {digit.isAnimating ? (
            <>
              {/* Previous digit (slides out) */}
              <span
                key={`prev-${digit.animationKey}`}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: `slideOut${direction === 'down' ? 'Up' : 'Down'} ${duration}ms ease-out forwards`,
                }}
              >
                {digit.prev}
              </span>
              
              {/* New digit (slides in) */}
              <span
                key={`curr-${digit.animationKey}`}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: `slideIn${direction === 'down' ? 'FromUp' : 'FromDown'} ${duration}ms ease-out forwards`,
                }}
              >
                {digit.current}
              </span>
            </>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              {digit.current}
            </span>
          )}
        </span>
      ))}
      <style jsx>{`
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-120%); opacity: 0; }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(120%); opacity: 0; }
        }
        @keyframes slideInFromUp {
          from { transform: translateY(-120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInFromDown {
          from { transform: translateY(120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </span>
  )
}

export default AnimatedNumber
