import { CSVCourse } from '@/components/CourseBlock'

// Parse CSV data from public folder
export async function loadCoursesFromCSV(): Promise<CSVCourse[]> {
  try {
    const response = await fetch('/data_vme_rows.csv')
    const text = await response.text()
    return parseCSV(text)
  } catch (error) {
    console.error('Failed to load CSV:', error)
    return []
  }
}

// Parse CSV text to course objects
function parseCSV(csvText: string): CSVCourse[] {
  const lines = csvText.trim().split('\n')
  const courses: CSVCourse[] = []
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    // Parse CSV with proper handling of quoted fields
    const fields = parseCSVLine(line)
    if (fields.length < 15) continue
    
    const course: CSVCourse = {
      courseCode: fields[0] || '',
      prefix: fields[1] || '',
      courseTitle: fields[3] || '',
      section: fields[4] || '',
      seatLimit: parseInt(fields[5]) || 0,
      seatUsed: parseInt(fields[6]) || 0,
      seatLeft: parseInt(fields[7]) || 0,
      startTime: normalizeTime(fields[8]),
      endTime: normalizeTime(fields[9]),
      instructor: fields[10]?.replace(/"/g, '') || '-',
      day: fields[14] || '',
    }
    
    // Skip invalid courses (no time or day)
    if (course.startTime && course.endTime && course.day) {
      courses.push(course)
    }
  }
  
  return courses
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  
  return result
}

// Normalize time format (e.g., "9:00:00" -> "9:00")
function normalizeTime(time: string): string {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) {
    return `${parseInt(parts[0])}:${parts[1].padStart(2, '0')}`
  }
  return time
}

// Convert time string to minutes
export function timeToMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

// Check if two courses overlap in time
export function coursesOverlap(a: CSVCourse, b: CSVCourse): boolean {
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)
  
  return aStart < bEnd && bStart < aEnd
}

// Group courses by day
export function groupCoursesByDay(courses: CSVCourse[]): Record<string, CSVCourse[]> {
  const grouped: Record<string, CSVCourse[]> = {}
  
  courses.forEach(course => {
    if (!grouped[course.day]) {
      grouped[course.day] = []
    }
    grouped[course.day].push(course)
  })
  
  return grouped
}

// Assign lanes to overlapping courses (max lanes with overflow)
export interface LanedCourse {
  course: CSVCourse
  lane: number
  isOverflow: boolean
  overflowCount: number
  // Store actual pixel-like positions for collision detection
  leftPos: number
  rightPos: number
}

// Check if two courses collide (considering minimum width)
function coursesCollide(a: { leftPos: number, rightPos: number }, b: { leftPos: number, rightPos: number }): boolean {
  return a.leftPos < b.rightPos && b.leftPos < a.rightPos
}

export function assignLanes(courses: CSVCourse[], maxLanes: number = 4): LanedCourse[] {
  if (courses.length === 0) return []
  
  // Calculate positions for each course (as percentage of timeline)
  // Using a reference span of 780 minutes (7:30 to 20:30)
  const START_MIN = 7 * 60 + 30
  const SPAN_MIN = 780
  const MIN_WIDTH = 6 // Minimum 6% width
  
  const coursesWithPos = courses.map(course => {
    const s = timeToMinutes(course.startTime)
    const e = timeToMinutes(course.endTime)
    const left = ((Math.max(s, START_MIN) - START_MIN) / SPAN_MIN) * 100
    const right = ((Math.min(e, START_MIN + SPAN_MIN) - START_MIN) / SPAN_MIN) * 100
    const width = Math.max(MIN_WIDTH, right - left)
    
    return {
      course,
      leftPos: left,
      rightPos: left + width, // Use actual rendered width for collision
    }
  })
  
  // Sort by start position, then by width (wider first)
  coursesWithPos.sort((a, b) => {
    if (a.leftPos !== b.leftPos) return a.leftPos - b.leftPos
    return (b.rightPos - b.leftPos) - (a.rightPos - a.leftPos) // Wider first
  })
  
  // Track courses in each lane for collision detection
  const lanes: { leftPos: number, rightPos: number }[][] = []
  const result: LanedCourse[] = []
  const overflowCourses: typeof coursesWithPos = []
  
  coursesWithPos.forEach(item => {
    // Find first lane where this course doesn't collide with any existing course
    let assignedLane = -1
    
    for (let laneIdx = 0; laneIdx < lanes.length; laneIdx++) {
      const laneItems = lanes[laneIdx]
      const hasCollision = laneItems.some(existing => coursesCollide(existing, item))
      
      if (!hasCollision) {
        assignedLane = laneIdx
        break
      }
    }
    
    // Create new lane if needed
    if (assignedLane === -1) {
      if (lanes.length < maxLanes) {
        assignedLane = lanes.length
        lanes.push([])
      } else {
        // Overflow - too many overlaps
        overflowCourses.push(item)
        return
      }
    }
    
    // Add to lane
    lanes[assignedLane].push({ leftPos: item.leftPos, rightPos: item.rightPos })
    result.push({
      course: item.course,
      lane: assignedLane,
      isOverflow: false,
      overflowCount: 0,
      leftPos: item.leftPos,
      rightPos: item.rightPos,
    })
  })
  
  // Mark overflow count on visible courses that overlap with overflow
  if (overflowCourses.length > 0 && result.length > 0) {
    overflowCourses.forEach(overflow => {
      const overlapping = result.filter(r => coursesCollide(r, overflow))
      if (overlapping.length > 0) {
        overlapping[overlapping.length - 1].overflowCount++
      }
    })
  }
  
  return result
}
