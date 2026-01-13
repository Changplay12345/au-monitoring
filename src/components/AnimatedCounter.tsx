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
}

export function RollingCounter({ value, className = '', size = 'md' }: RollingCounterProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [prevDigits, setPrevDigits] = useState<string[]>([]);
  const [directions, setDirections] = useState<('up' | 'down' | 'none')[]>([]);
  const prevValueRef = useRef(value);

  const sizeClasses = {
    sm: 'h-5 text-sm',
    md: 'h-7 text-lg',
    lg: 'h-10 text-2xl'
  };

  useEffect(() => {
    const newDigits = String(value).split('');
    const oldDigits = String(prevValueRef.current).split('');
    
    // Pad to same length
    const maxLen = Math.max(newDigits.length, oldDigits.length);
    while (newDigits.length < maxLen) newDigits.unshift('0');
    while (oldDigits.length < maxLen) oldDigits.unshift('0');
    
    // Calculate directions
    const newDirections = newDigits.map((d, i) => {
      if (d === oldDigits[i]) return 'none' as const;
      return parseInt(d) > parseInt(oldDigits[i]) ? 'up' as const : 'down' as const;
    });
    
    // If overall value increased, all changing digits go up
    const overallDirection = value > prevValueRef.current ? 'up' : 'down';
    const finalDirections = newDirections.map(d => d === 'none' ? 'none' : overallDirection);
    
    setPrevDigits(oldDigits);
    setDigits(newDigits);
    setDirections(finalDirections);
    prevValueRef.current = value;
  }, [value]);

  return (
    <span className={`inline-flex font-mono tabular-nums ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {digits.map((digit, i) => (
        <span 
          key={i} 
          className={`relative overflow-hidden ${sizeClasses[size]} w-[0.65em] inline-flex items-center justify-center`}
        >
          {/* Previous digit (animates out) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-250 ease-out ${
              directions[i] === 'none' 
                ? 'translate-y-0 opacity-100'
                : directions[i] === 'up'
                  ? '-translate-y-full opacity-0'
                  : 'translate-y-full opacity-0'
            }`}
          >
            {prevDigits[i] || '0'}
          </span>
          {/* New digit (animates in) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-250 ease-out ${
              directions[i] === 'none'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-0 opacity-100'
            }`}
            style={{
              transform: directions[i] === 'none' 
                ? 'translateY(0)' 
                : undefined,
              animation: directions[i] !== 'none' 
                ? `rollIn${directions[i] === 'up' ? 'Up' : 'Down'} 250ms ease-out forwards`
                : undefined
            }}
          >
            {digit}
          </span>
        </span>
      ))}
      <style jsx>{`
        @keyframes rollInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rollInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
