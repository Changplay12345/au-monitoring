'use client'

import { useState, useEffect, useMemo } from 'react'
import { CSVCourse } from '@/components/CourseBlock'
import { loadCoursesFromCSV, timeToMinutes } from '@/lib/courseData'
import { CourseLane } from './CourseLane'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

// Time axis configuration
const START_MIN = 7 * 60 + 30  // 07:30
const END_MIN = 19 * 60 + 30   // 19:30
const SPAN_MIN = END_MIN - START_MIN
const STEP_MIN = 90            // 1.5 hours
const NUM_CELLS = SPAN_MIN / STEP_MIN  // 8 cells

// Generate time ticks - position matches grid lines exactly
const TIME_TICKS = Array.from({ length: NUM_CELLS + 1 }, (_, i) => {
  const t = START_MIN + i * STEP_MIN
  const h = String(Math.floor(t / 60)).padStart(2, '0')
  const m = String(t % 60).padStart(2, '0')
  // Use exact cell-based positioning to match grid lines
  const position = (i / NUM_CELLS) * 100
  return { time: `${h}:${m}`, position }
})

interface SwimlaneScheduleProps {
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
}

// Group courses by course code
function groupByCourseCode(courses: CSVCourse[]): Map<string, CSVCourse[]> {
  const grouped = new Map<string, CSVCourse[]>()
  
  courses.forEach(course => {
    const existing = grouped.get(course.courseCode) || []
    existing.push(course)
    grouped.set(course.courseCode, existing)
  })
  
  return grouped
}

export function SwimlaneSchedule({ day }: SwimlaneScheduleProps) {
  const [courses, setCourses] = useState<CSVCourse[]>([])
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [selectedSections, setSelectedSections] = useState<CSVCourse[] | null>(null)

  // Load courses on mount
  useEffect(() => {
    loadCoursesFromCSV().then(allCourses => {
      // Filter for the specified day only
      const dayCourses = allCourses.filter(c => c.day === day)
      setCourses(dayCourses)
    })
  }, [day])

  // Group courses by course code
  const courseGroups = useMemo(() => groupByCourseCode(courses), [courses])

  // Sort course codes alphabetically
  const sortedCourseCodes = useMemo(() => 
    Array.from(courseGroups.keys()).sort(), 
    [courseGroups]
  )

  // Handle section click - show popover
  const handleSectionClick = (sections: CSVCourse[]) => {
    setSelectedSections(sections)
  }

  // Close popover
  const closePopover = () => {
    setSelectedSections(null)
  }

  if (courses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No courses found for {day}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Time labels - positioned above the spikes */}
      <div className="relative ml-[140px] mr-[20px] h-5 mb-0">
        {TIME_TICKS.map((tick, i) => (
          <div
            key={i}
            className="absolute top-0 -translate-x-1/2 text-xs text-gray-500 font-semibold"
            style={{ left: `${tick.position}%` }}
          >
            {tick.time}
          </div>
        ))}
      </div>

      {/* Main container with shadow */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden relative">
        {/* Spike lines extending above the table border */}
        <div className="absolute -top-3 left-[140px] right-[20px] h-3 pointer-events-none z-10">
          {TIME_TICKS.map((tick, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2"
              style={{ left: `${tick.position}%` }}
            />
          ))}
        </div>

        {/* Content - no scroll, show all */}
        <div>
          {/* Grid lines overlay */}
          <div className="relative">
            {/* Vertical grid lines inside the table */}
            <div 
              className="absolute top-0 bottom-0 left-[140px] right-[20px] pointer-events-none z-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  to right,
                  #e5e7eb 0px,
                  #e5e7eb 1px,
                  transparent 1px,
                  transparent ${100 / NUM_CELLS}%
                )`,
              }}
            />
            {/* End line at 19:30 - lighter color to match grid lines */}
            <div className="absolute top-0 bottom-0 right-[20px] w-px bg-gray-200 pointer-events-none z-0" />

            {/* Course lanes */}
            {sortedCourseCodes.map(courseCode => (
              <CourseLane
                key={courseCode}
                courseCode={courseCode}
                sections={courseGroups.get(courseCode) || []}
                timelineStart={START_MIN}
                timelineSpan={SPAN_MIN}
                hoveredCourse={hoveredCourse}
                onHover={setHoveredCourse}
                onSectionClick={handleSectionClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Section Detail Popover */}
      {selectedSections && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[100] animate-in fade-in duration-200"
            onClick={closePopover}
          />
          
          {/* Popover */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedSections[0].courseCode}
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-[300px]">
                  {selectedSections[0].courseTitle}
                </p>
              </div>
              <button 
                onClick={closePopover}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Sections list */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedSections.map((section, idx) => {
                const ratio = section.seatLimit > 0 ? section.seatLeft / section.seatLimit : 0
                const statusColor = ratio >= 0.5 ? 'emerald' : ratio >= 0.25 ? 'amber' : ratio > 0 ? 'orange' : 'red'
                
                return (
                  <div 
                    key={`${section.section}-${idx}`}
                    className={cn(
                      'p-3 rounded-lg border-2',
                      `bg-${statusColor}-50 border-${statusColor}-300`
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-gray-800">
                          Section {section.section}
                        </span>
                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                          <div>⏰ {section.startTime} - {section.endTime}</div>
                          <div>👤 {section.instructor}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-bold text-white',
                        ratio >= 0.5 ? 'bg-emerald-500' :
                        ratio >= 0.25 ? 'bg-amber-500' :
                        ratio > 0 ? 'bg-orange-500' : 'bg-red-500'
                      )}>
                        {section.seatLeft}/{section.seatLimit}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
