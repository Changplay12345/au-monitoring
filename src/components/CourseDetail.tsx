'use client'

import { NormalizedCourse } from '@/lib/types'
import { formatTimeRange, normalizeExamDate, computeSeatLeft } from '@/lib/utils'
import { X } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'

interface CourseDetailProps {
  course: NormalizedCourse
  onClose: () => void
}

export function CourseDetail({ course, onClose }: CourseDetailProps) {
  const seatLeft = computeSeatLeft(course)
  const seatText = course.seatUsed !== null && course.seatLimit !== null
    ? `${course.seatUsed}/${course.seatLimit}`
    : '—'

  const midDate = normalizeExamDate(course.midtermDate)
  const finDate = normalizeExamDate(course.finalDate)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md text-sm text-gray-800 max-w-full">
      <div className="flex justify-between items-start gap-2">
        <strong className="block mb-1.5 text-sm">
          {course.code} - {course.title || ''} Section: {course.section || ''}
        </strong>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-0.5 text-xs text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Seat:</span> {seatText}
          {seatLeft !== null && course.seatLimit !== null && (
            <span className="text-gray-500"> (<AnimatedNumber value={seatLeft} /> left)</span>
          )}
        </p>
        <p>
          <span className="font-medium text-gray-700">Day:</span> {course.day || '—'}{' '}
          <span className="font-medium text-gray-700">Time:</span> {formatTimeRange(course.start, course.end)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Instructor:</span> {course.instructor || '—'}
        </p>
        <p>
          <span className="font-medium text-gray-700">Midterm:</span>{' '}
          {midDate !== '-'
            ? `${midDate} Time: ${formatTimeRange(course.midtermStart || '', course.midtermEnd || '')}`
            : '—'}
        </p>
        <p>
          <span className="font-medium text-gray-700">Final:</span>{' '}
          {finDate !== '-'
            ? `${finDate} Time: ${formatTimeRange(course.finalStart || '', course.finalEnd || '')}`
            : '—'}
        </p>
        <p>
          <span className="font-medium text-gray-700">Remark:</span> {course.remark || 'None'}
        </p>
      </div>
    </div>
  )
}
