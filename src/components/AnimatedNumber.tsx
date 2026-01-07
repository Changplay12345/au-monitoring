'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
}

interface DigitProps {
  digit: string
  prevDigit: string
  direction: 'up' | 'down'
  duration: number
  isAnimating: boolean
}

function AnimatedDigit({ digit, prevDigit, direction, duration, isAnimating }: DigitProps) {
  const hasChanged = isAnimating && digit !== prevDigit

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ 
        width: '0.65em',
        height: '1.2em',
      }}
    >
      {/* Previous digit (slides out) */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: hasChanged 
            ? direction === 'down' 
              ? 'translateY(-120%)' 
              : 'translateY(120%)'
            : 'translateY(0)',
          transition: hasChanged ? `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
          opacity: hasChanged ? 0 : 1,
        }}
      >
        {prevDigit}
      </span>
      
      {/* New digit (slides in) */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: hasChanged 
            ? 'translateY(0)' 
            : direction === 'down' 
              ? 'translateY(120%)' 
              : 'translateY(-120%)',
          transition: hasChanged ? `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
          opacity: hasChanged ? 1 : 0,
        }}
      >
        {digit}
      </span>
      
      {/* Static display when not animating */}
      {!hasChanged && (
        <span className="absolute inset-0 flex items-center justify-center">
          {digit}
        </span>
      )}
    </span>
  )
}

export function AnimatedNumber({ value, className = '', duration = 350 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (displayValue !== value) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Determine direction (down = number decreasing, scroll from top)
      setDirection(value < displayValue ? 'down' : 'up')
      setPrevValue(displayValue)
      
      if (prefersReducedMotion) {
        // Skip animation for reduced motion
        setDisplayValue(value)
      } else {
        // Start animation
        setIsAnimating(true)
        setDisplayValue(value)
        
        // End animation after duration
        timeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, duration + 50)
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, displayValue, duration, prefersReducedMotion])

  // Convert numbers to digit arrays
  const currentDigits = String(displayValue).split('')
  const prevDigits = String(prevValue).split('')
  
  // Pad shorter array to match length
  const maxLength = Math.max(currentDigits.length, prevDigits.length)
  while (currentDigits.length < maxLength) currentDigits.unshift(' ')
  while (prevDigits.length < maxLength) prevDigits.unshift(' ')

  return (
    <span 
      className={`inline-flex ${className}`}
      style={{ lineHeight: 1 }}
    >
      {currentDigits.map((digit, index) => (
        <AnimatedDigit
          key={`${index}-${maxLength}`}
          digit={digit}
          prevDigit={prevDigits[index]}
          direction={direction}
          duration={duration}
          isAnimating={isAnimating}
        />
      ))}
    </span>
  )
}

export default AnimatedNumber
