'use client'

import { useMemo } from 'react'
import { CSVCourse } from '@/components/CourseBlock'
import { SectionBlock, CollapsedBlock } from './SectionBlock'
import { timeToMinutes } from '@/lib/courseData'

interface CourseLaneProps {
  courseCode: string
  sections: CSVCourse[]
  timelineStart: number  // in minutes (e.g., 7*60+30 = 450)
  timelineSpan: number   // in minutes (e.g., 780)
  hoveredCourse: string | null
  onHover: (courseCode: string | null) => void
  onSectionClick: (sections: CSVCourse[]) => void
  maxStackVisible?: number
}

// Group sections by overlapping time slots
interface TimeSlot {
  startMin: number
  endMin: number
  sections: CSVCourse[]
}

function groupSectionsByTimeSlot(sections: CSVCourse[]): TimeSlot[] {
  if (sections.length === 0) return []

  // Sort by start time
  const sorted = [...sections].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )

  const slots: TimeSlot[] = []
  
  sorted.forEach(section => {
    const start = timeToMinutes(section.startTime)
    const end = timeToMinutes(section.endTime)
    
    // Find existing slot that this section overlaps with
    let foundSlot = false
    for (const slot of slots) {
      if (start < slot.endMin && end > slot.startMin) {
        // Overlaps - add to this slot
        slot.sections.push(section)
        slot.startMin = Math.min(slot.startMin, start)
        slot.endMin = Math.max(slot.endMin, end)
        foundSlot = true
        break
      }
    }
    
    if (!foundSlot) {
      slots.push({
        startMin: start,
        endMin: end,
        sections: [section]
      })
    }
  })

  return slots
}

export function CourseLane({
  courseCode,
  sections,
  timelineStart,
  timelineSpan,
  hoveredCourse,
  onHover,
  onSectionClick,
  maxStackVisible = 4,
}: CourseLaneProps) {
  const isHovered = hoveredCourse === courseCode

  // Group sections by time slot for stacking
  const timeSlots = useMemo(() => groupSectionsByTimeSlot(sections), [sections])

  // Calculate lane height based on max stack (minimum 1 row with margin)
  const maxStack = Math.max(...timeSlots.map(slot => Math.min(slot.sections.length, maxStackVisible)), 1)
  const BLOCK_HEIGHT = 28
  const STACK_GAP = 2
  const LANE_PADDING = 12  // More padding for cleaner look
  const laneHeight = maxStack * (BLOCK_HEIGHT + STACK_GAP) + LANE_PADDING

  return (
    <div className="flex border-b border-gray-200 last:border-b-0">
      {/* Sticky course label - inline format */}
      <div className="sticky left-0 z-20 w-[140px] flex-shrink-0 bg-white border-r border-gray-200 px-3 py-2 flex items-center">
        <span className="font-semibold text-gray-800 text-sm truncate" title={`${courseCode} (${sections.length} section${sections.length !== 1 ? 's' : ''})`}>
          {courseCode} <span className="font-normal text-gray-500">({sections.length})</span>
        </span>
      </div>

      {/* Timeline area - aligned with time ruler, mr-[20px] for 19:30 padding */}
      <div 
        className="flex-1 relative mr-[20px]"
        style={{ minHeight: `${laneHeight}px` }}
      >
        {/* Render each time slot */}
        {timeSlots.map((slot, slotIdx) => {
          // Simple percentage positioning - matches time header
          const left = ((slot.startMin - timelineStart) / timelineSpan) * 100
          const width = ((slot.endMin - slot.startMin) / timelineSpan) * 100

          // If too many sections, show collapsed view
          if (slot.sections.length > maxStackVisible) {
            return (
              <CollapsedBlock
                key={`slot-${slotIdx}`}
                sections={slot.sections}
                left={left}
                width={width}
                isHovered={isHovered}
                onHover={onHover}
                onClick={onSectionClick}
              />
            )
          }

          // Render individual section blocks stacked
          return slot.sections.map((section, stackIdx) => (
            <SectionBlock
              key={`${section.courseCode}-${section.section}-${stackIdx}`}
              section={section}
              left={left}
              width={width}
              stackIndex={stackIdx}
              stackTotal={slot.sections.length}
              isHovered={isHovered}
              onHover={onHover}
              onClick={onSectionClick}
              allSections={slot.sections}
            />
          ))
        })}
      </div>
    </div>
  )
}
