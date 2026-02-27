'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle, Users, Clock, Calendar, User, BookOpen, ExternalLink } from 'lucide-react'
import { Notification } from '@/types/notification'
import { Portal } from '@/components/Portal'

interface CourseDetailPopupProps {
  isOpen: boolean
  notification: Notification
  onClose: () => void
  onNavigate: () => void
}

export function CourseDetailPopup({ isOpen, notification, onClose, onNavigate }: CourseDetailPopupProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const seatLeft = notification.seatLimit != null && notification.seatUsed != null 
    ? notification.seatLimit - notification.seatUsed 
    : null
  const isFull = seatLeft === 0 || notification.type === 'COURSE_FULL'

  return (
    <Portal containerId="course-detail-popup-root">
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header with status */}
          <div className={`px-5 py-4 ${isFull ? 'bg-red-600' : 'bg-green-600'} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold text-lg">
                  {isFull ? 'Course Full' : 'Course Available'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Course Info */}
          <div className="p-5 space-y-4">
            {/* Course Code & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Course</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {notification.courseCode}
              </h3>
              {notification.courseTitle && (
                <p className="text-sm text-gray-600 mt-0.5">{notification.courseTitle}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Section */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs text-gray-500">Section</span>
                </div>
                <p className="font-semibold text-gray-900">{notification.section || '-'}</p>
              </div>

              {/* Seats */}
              <div className={`rounded-lg p-3 ${isFull ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Seats</span>
                </div>
                <p className={`font-semibold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                  {notification.seatUsed ?? '-'}/{notification.seatLimit ?? '-'}
                  <span className="text-xs font-normal ml-1">
                    ({seatLeft ?? 0} left)
                  </span>
                </p>
              </div>

              {/* Day & Time */}
              {notification.day && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Schedule</span>
                  </div>
                  <p className="font-semibold text-gray-900">{notification.day}</p>
                  {notification.startTime && (
                    <p className="text-xs text-gray-600">
                      {notification.startTime} - {notification.endTime || ''}
                    </p>
                  )}
                </div>
              )}

              {/* Instructor */}
              {notification.instructorName && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Instructor</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {notification.instructorName}
                  </p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className={`flex items-center justify-center gap-2 py-3 rounded-lg ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">
                {isFull ? 'This course section is currently FULL' : 'Seats are available'}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View in Timetable
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
