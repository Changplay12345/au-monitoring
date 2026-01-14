'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 250, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const prevValueRef = useRef(value);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setDirection(value > prevValueRef.current ? 'up' : 'down');
      setIsAnimating(true);
      
      // Animate the number change
      const startValue = prevValueRef.current;
      const endValue = value;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const current = Math.round(startValue + (endValue - startValue) * eased);
        setDisplayValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
      prevValueRef.current = value;
    }
  }, [value, duration]);

  return (
    <span 
      ref={containerRef}
      className={`inline-block tabular-nums font-mono transition-transform duration-200 ${className} ${
        isAnimating ? (direction === 'up' ? 'text-green-600' : 'text-red-500') : ''
      }`}
      style={{ 
        fontVariantNumeric: 'tabular-nums',
        minWidth: `${String(value).length}ch`
      }}
    >
      {displayValue}
    </span>
  );
}

// Odometer-style digit animation
interface OdometerDigitProps {
  digit: string;
  direction: 'up' | 'down';
}

function OdometerDigit({ digit, direction }: OdometerDigitProps) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevDigit !== digit) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setPrevDigit(digit);
        setIsAnimating(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <span className="relative inline-block overflow-hidden h-[1.2em] w-[0.6em]">
      <span
        className={`absolute inset-0 flex flex-col items-center transition-transform duration-250 ease-out ${
          isAnimating 
            ? direction === 'up' 
              ? '-translate-y-[1.2em]' 
              : 'translate-y-[1.2em]'
            : 'translate-y-0'
        }`}
      >
        <span className="h-[1.2em] flex items-center">{prevDigit}</span>
      </span>
      <span
        className={`absolute inset-0 flex flex-col items-center transition-transform duration-250 ease-out ${
          isAnimating 
            ? 'translate-y-0'
            : direction === 'up'
              ? 'translate-y-[1.2em]'
              : '-translate-y-[1.2em]'
        }`}
      >
        <span className="h-[1.2em] flex items-center">{digit}</span>
      </span>
    </span>
  );
}

// Full odometer component for seat display like "12/50"
interface SeatCounterProps {
  used: number;
  total: number;
  className?: string;
}

export function SeatCounter({ used, total, className = '' }: SeatCounterProps) {
  const [displayUsed, setDisplayUsed] = useState(used);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevUsedRef = useRef(used);

  useEffect(() => {
    if (prevUsedRef.current !== used) {
      const newDirection = used > prevUsedRef.current ? 'up' : 'down';
      setDirection(newDirection);
      setIsAnimating(true);
      
      const startValue = prevUsedRef.current;
      const endValue = used;
      const startTime = performance.now();
      const duration = 250;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const current = Math.round(startValue + (endValue - startValue) * eased);
        setDisplayUsed(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayUsed(endValue);
          setTimeout(() => setIsAnimating(false), 50);
        }
      };
      
      requestAnimationFrame(animate);
      prevUsedRef.current = used;
    }
  }, [used]);

  // Calculate fill percentage for color
  const fillPercent = total > 0 ? (used / total) * 100 : 0;
  const colorClass = fillPercent >= 100 
    ? 'text-red-600' 
    : fillPercent >= 80 
      ? 'text-orange-500' 
      : 'text-green-600';

  // Pad numbers to match total's digit count for alignment
  const maxDigits = String(total).length;
  const usedStr = String(displayUsed).padStart(maxDigits, '\u2007'); // Figure space for alignment

  return (
    <span 
      className={`inline-flex items-baseline font-mono tabular-nums ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <span 
        className={`relative overflow-hidden transition-colors duration-200 ${
          isAnimating ? (direction === 'up' ? 'text-orange-500' : 'text-green-500') : colorClass
        }`}
        style={{ minWidth: `${maxDigits}ch` }}
      >
        <span className={`inline-block transition-transform duration-200 ${
          isAnimating ? (direction === 'up' ? 'scale-110' : 'scale-90') : 'scale-100'
        }`}>
          {usedStr}
        </span>
      </span>
      <span className="text-gray-400 mx-0.5">/</span>
      <span className="text-gray-600" style={{ minWidth: `${maxDigits}ch` }}>
        {total}
      </span>
    </span>
  );
}

// Rolling digit odometer for more dramatic effect
interface RollingCounterProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onChangeDirection?: (direction: 'up' | 'down' | null) => void;
}

export function RollingCounter({ value, className = '', size = 'md', onChangeDirection }: RollingCounterProps) {
  const [displayDigits, setDisplayDigits] = useState<{ current: string; prev: string; direction: 'up' | 'down' | 'none'; key: number }[]>([]);
  const prevValueRef = useRef(value);
  const animationKeyRef = useRef(0);

  const sizeClasses = {
    sm: 'h-5 text-sm',
    md: 'h-7 text-lg',
    lg: 'h-10 text-2xl'
  };

  useEffect(() => {
    const newValue = value;
    const oldValue = prevValueRef.current;
    
    if (newValue === oldValue && displayDigits.length > 0) return;
    
    const newStr = String(newValue);
    const oldStr = String(oldValue);
    
    // Pad to same length
    const maxLen = Math.max(newStr.length, oldStr.length);
    const newDigits = newStr.padStart(maxLen, '0').split('');
    const oldDigits = oldStr.padStart(maxLen, '0').split('');
    
    // Overall direction based on value change
    const overallDirection: 'up' | 'down' | 'none' = newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'none';
    
    // Notify parent of direction change
    if (onChangeDirection && overallDirection !== 'none') {
      onChangeDirection(overallDirection);
      // Clear after animation
      setTimeout(() => onChangeDirection(null), 400);
    }
    
    // Create digit objects - ALL digits that changed get animated
    const digits = newDigits.map((digit, i) => {
      const changed = digit !== oldDigits[i];
      return {
        current: digit,
        prev: oldDigits[i],
        direction: changed ? overallDirection : 'none' as const,
        key: changed ? ++animationKeyRef.current : animationKeyRef.current,
      };
    });
    
    setDisplayDigits(digits);
    prevValueRef.current = newValue;
  }, [value, onChangeDirection]);

  // Initialize on mount
  useEffect(() => {
    if (displayDigits.length === 0) {
      const str = String(value);
      setDisplayDigits(str.split('').map((d, i) => ({
        current: d,
        prev: d,
        direction: 'none' as const,
        key: i,
      })));
    }
  }, []);

  return (
    <span className={`inline-flex font-mono tabular-nums ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {displayDigits.map((digit, i) => (
        <span 
          key={i} 
          className={`relative overflow-hidden ${sizeClasses[size]} w-[0.65em] inline-flex items-center justify-center`}
        >
          {digit.direction !== 'none' ? (
            <>
              {/* Previous digit (animates out) */}
              <span
                key={`prev-${digit.key}`}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: `slideOut${digit.direction === 'down' ? 'Up' : 'Down'} 300ms ease-out forwards`
                }}
              >
                {digit.prev}
              </span>
              {/* New digit (animates in) */}
              <span
                key={`curr-${digit.key}`}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: `slideIn${digit.direction === 'down' ? 'FromUp' : 'FromDown'} 300ms ease-out forwards`
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
          to { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        @keyframes slideInFromUp {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInFromDown {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
