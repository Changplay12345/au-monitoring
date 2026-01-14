'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from './AnimatedNumber'

// Course data from CSV
export interface CSVCourse {
  courseCode: string
  prefix: string
  courseTitle: string
  section: string
  seatLimit: number
  seatUsed: number
  seatLeft: number
  startTime: string
  endTime: string
  day: string
  instructor: string
}

interface CourseBlockProps {
  course: CSVCourse
  startMin: number
  spanMin: number
  groupStartMin?: number  // Timeline start (for positioning)
  groupSpanMin?: number   // Timeline span (for positioning)
  stackIndex?: number
  stackTotal?: number
  onClick?: (course: CSVCourse) => void
}

// Get seat color based on seats left
function getSeatColor(seatLeft: number, seatLimit: number): string {
  if (seatLimit === 0) return 'bg-gray-400'
  const ratio = seatLeft / seatLimit
  if (ratio >= 0.5) return 'bg-emerald-500' // 50%+ left = green
  if (ratio >= 0.25) return 'bg-amber-500'  // 25-50% left = yellow
  if (ratio > 0) return 'bg-orange-500'     // <25% left = orange
  return 'bg-red-500'                        // 0 left = red
}

// Get block background color based on seats
function getBlockBgColor(seatLeft: number, seatLimit: number): string {
  if (seatLimit === 0) return 'bg-gray-300'
  const ratio = seatLeft / seatLimit
  if (ratio >= 0.5) return 'bg-emerald-100 border-emerald-400'
  if (ratio >= 0.25) return 'bg-amber-100 border-amber-400'
  if (ratio > 0) return 'bg-orange-100 border-orange-400'
  return 'bg-red-100 border-red-400'
}

// Get glow color based on seats (for animation)
function getGlowColor(seatLeft: number, seatLimit: number): string {
  if (seatLimit === 0) return 'shadow-gray-400/50'
  const ratio = seatLeft / seatLimit
  if (ratio >= 0.5) return 'shadow-emerald-400/60'
  if (ratio >= 0.25) return 'shadow-amber-400/60'
  if (ratio > 0) return 'shadow-orange-400/60'
  return 'shadow-red-400/60'
}

// Convert time string to minutes
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function CourseBlock({
  course,
  startMin,
  spanMin,
  groupStartMin,
  groupSpanMin,
  stackIndex = 0,
  stackTotal = 1,
  onClick,
}: CourseBlockProps) {
  const [isGlowing, setIsGlowing] = useState(false)
  
  // Handle seat change animation - trigger glow
  const handleSeatChange = useCallback((direction: 'up' | 'down' | null) => {
    if (direction) {
      setIsGlowing(true)
    } else {
      setIsGlowing(false)
    }
  }, [])
  // Use group positioning if provided, otherwise use course time
  const timelineStart = groupStartMin ?? startMin
  const timelineSpan = groupSpanMin ?? spanMin
  
  // Calculate actual course duration from its start/end time
  const actualCourseDuration = timeToMinutes(course.endTime) - timeToMinutes(course.startTime)
  
  // Calculate position on timeline
  const left = ((startMin - timelineStart) / timelineSpan) * 100
  const rawWidth = (spanMin / timelineSpan) * 100
  // Width calculation
  const width = Math.max(8, rawWidth)
  // Add margin-right for 1-hour courses to create gap
  const marginRight = actualCourseDuration <= 60 ? '6px' : '0px'

  // Stack offset for overlapping courses (not used in group mode)
  const stackOffset = stackIndex * 4

  return (
    <div
      className={cn(
        'absolute rounded-lg border-2 cursor-pointer transition-all duration-200',
        'hover:z-50 hover:shadow-xl hover:scale-105',
        stackTotal > 1 && 'hover:animate-shake',
        getBlockBgColor(course.seatLeft, course.seatLimit),
        isGlowing && 'shadow-lg',
        isGlowing && getGlowColor(course.seatLeft, course.seatLimit)
      )}
      style={{
        left: `${left}%`,
        width: `calc(${width}% - ${marginRight})`,
        top: `${4 + stackOffset}px`,
        height: `${64 - stackOffset * 2}px`,
        zIndex: isGlowing ? 100 : stackTotal - stackIndex,
      }}
      onClick={() => onClick?.(course)}
      title={`${course.courseCode} - ${course.courseTitle}\nSection: ${course.section}\nSeats: ${course.seatLeft}/${course.seatLimit} left\nInstructor: ${course.instructor}`}
    >
      {/* Course code */}
      <span className="absolute left-2 right-2 top-2 text-sm font-bold text-gray-800 truncate">
        {course.courseCode}
      </span>

      {/* Seat left badge - bottom right */}
      <span
        className={cn(
          'absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-bold text-white shadow-sm',
          getSeatColor(course.seatLeft, course.seatLimit)
        )}
      >
        <AnimatedNumber value={course.seatLeft} onChangeDirection={handleSeatChange} />
      </span>

      {/* Stack indicator */}
      {stackTotal > 1 && stackIndex === 0 && (
        <span className="absolute bottom-1 left-2 text-xs text-gray-500 font-medium">
          +{stackTotal - 1}
        </span>
      )}
    </div>
  )
}
