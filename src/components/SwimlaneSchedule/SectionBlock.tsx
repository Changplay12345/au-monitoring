'use client'

import { cn } from '@/lib/utils'
import { CSVCourse } from '@/components/CourseBlock'

interface SectionBlockProps {
  section: CSVCourse
  left: number      // percentage position
  width: number     // percentage width
  stackIndex: number
  stackTotal: number
  isHovered: boolean
  onHover: (courseCode: string | null) => void
  onClick: (sections: CSVCourse[]) => void
  allSections: CSVCourse[]
}

// Get seat color based on availability
function getSeatColor(seatLeft: number, seatLimit: number): string {
  if (seatLimit === 0) return 'bg-gray-400'
  const ratio = seatLeft / seatLimit
  if (ratio >= 0.5) return 'bg-emerald-500'
  if (ratio >= 0.25) return 'bg-amber-500'
  if (ratio > 0) return 'bg-orange-500'
  return 'bg-red-500'
}

// Get block background color based on seats
function getBlockColors(seatLeft: number, seatLimit: number): { bg: string; border: string; hoverBg: string } {
  if (seatLimit === 0) return { bg: 'bg-gray-100', border: 'border-gray-300', hoverBg: 'hover:bg-gray-150' }
  const ratio = seatLeft / seatLimit
  if (ratio >= 0.5) return { bg: 'bg-emerald-50', border: 'border-emerald-400', hoverBg: 'hover:bg-emerald-100' }
  if (ratio >= 0.25) return { bg: 'bg-amber-50', border: 'border-amber-400', hoverBg: 'hover:bg-amber-100' }
  if (ratio > 0) return { bg: 'bg-orange-50', border: 'border-orange-400', hoverBg: 'hover:bg-orange-100' }
  return { bg: 'bg-red-50', border: 'border-red-400', hoverBg: 'hover:bg-red-100' }
}

export function SectionBlock({
  section,
  left,
  width,
  stackIndex,
  stackTotal,
  isHovered,
  onHover,
  onClick,
  allSections,
}: SectionBlockProps) {
  const colors = getBlockColors(section.seatLeft, section.seatLimit)
  
  // Calculate vertical stacking within the lane
  const BLOCK_HEIGHT = 28
  const STACK_GAP = 2
  const top = stackIndex * (BLOCK_HEIGHT + STACK_GAP)

  return (
    <div
      className={cn(
        'absolute rounded-md border cursor-pointer transition-all duration-200',
        'flex items-center justify-between px-2',
        colors.bg,
        colors.border,
        isHovered && 'ring-2 ring-red-500 ring-offset-1 shadow-lg z-50 scale-[1.02]',
        !isHovered && 'hover:shadow-md hover:z-40'
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 4)}%`,
        top: `${top}px`,
        height: `${BLOCK_HEIGHT}px`,
      }}
      onMouseEnter={() => onHover(section.courseCode)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(allSections)}
      title={`${section.courseCode} - ${section.courseTitle}\nSection: ${section.section}\nTime: ${section.startTime} - ${section.endTime}\nSeats: ${section.seatLeft}/${section.seatLimit}\nInstructor: ${section.instructor}`}
    >
      {/* Course code */}
      <span className="text-xs font-semibold text-gray-800 truncate">
        {section.section}
      </span>

      {/* Seat badge */}
      <span
        className={cn(
          'px-1 py-0.5 rounded text-[10px] font-bold text-white ml-1 flex-shrink-0',
          getSeatColor(section.seatLeft, section.seatLimit)
        )}
      >
        {section.seatLeft}
      </span>
    </div>
  )
}

// Collapsed block for many sections
interface CollapsedBlockProps {
  sections: CSVCourse[]
  left: number
  width: number
  isHovered: boolean
  onHover: (courseCode: string | null) => void
  onClick: (sections: CSVCourse[]) => void
}

export function CollapsedBlock({
  sections,
  left,
  width,
  isHovered,
  onHover,
  onClick,
}: CollapsedBlockProps) {
  const firstSection = sections[0]
  const colors = getBlockColors(firstSection.seatLeft, firstSection.seatLimit)

  return (
    <div
      className={cn(
        'absolute rounded-md border-2 cursor-pointer transition-all duration-200',
        'flex items-center justify-between px-2',
        colors.bg,
        colors.border,
        isHovered && 'ring-2 ring-red-500 ring-offset-1 shadow-lg z-50',
        !isHovered && 'hover:shadow-md hover:z-40'
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 6)}%`,
        top: '0px',
        height: '32px',
      }}
      onMouseEnter={() => onHover(firstSection.courseCode)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(sections)}
    >
      <span className="text-xs font-semibold text-gray-800 truncate">
        {firstSection.courseCode}
      </span>
      <span className="px-1.5 py-0.5 rounded bg-gray-700 text-white text-[10px] font-bold ml-1">
        +{sections.length}
      </span>
    </div>
  )
}
