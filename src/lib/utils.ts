import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Course, NormalizedCourse, SeatStatus, PREFIX_COLORS } from './types'

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time utilities
export function toMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr || timeStr.length < 5) return '—'
  return timeStr.slice(0, 5)
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Normalize raw course data from Supabase
export function normalizeCourse(raw: Course): NormalizedCourse {
  const limit = Number(raw['Seat Limit'])
  const used = Number(raw['Seat Used'])
  let left = raw['Seat Left'] == null
    ? (isFinite(limit) && isFinite(used) ? limit - used : null)
    : Number(raw['Seat Left'])

  if (left !== null && isFinite(left)) left = Math.max(0, left)

  return {
    code: (raw['Course Code'] ?? '').trim(),
    title: (raw['Course Title'] ?? '').trim(),
    prefix: (raw['Prefix'] ?? '').trim(),
    section: (raw['Section'] ?? '').trim(),
    start: raw['Start Time'],
    end: raw['End Time'],
    instructor: raw['Instructor Name'],
    session: raw['Session'],
    day: raw['Day'],
    dayNum: Number(raw['Day Number'] ?? 99),
    remark: raw['Remark'] ?? '',
    seatLimit: isFinite(limit) ? limit : null,
    seatUsed: isFinite(used) ? used : null,
    seatLeft: left !== null && isFinite(left) ? left : null,
    midtermDate: raw['Midterm Date'],
    midtermStart: raw['Midterm Start'],
    midtermEnd: raw['Midterm End'],
    finalDate: raw['Final Date'],
    finalStart: raw['Final Start'],
    finalEnd: raw['Final End'],
  }
}

// Get seat status for color coding
export function getSeatStatus(limit: number | null, used: number | null, left: number | null): SeatStatus {
  const L = Number(limit)
  const U = Number(used)
  const R = Number(left)

  if (!Number.isFinite(L) || !Number.isFinite(U)) return null

  const leftVal = Number.isFinite(R) ? R : (L - U)

  if (leftVal <= 0) return 'full'
  if (L > 0 && U / L >= 0.90) return 'warn'
  return 'green'
}

// Get color class for prefix
export function getPrefixColor(prefix: string): string {
  return PREFIX_COLORS[prefix] || 'bg-amber-700'
}

// Normalize exam date
export function normalizeExamDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === '-') return '-'
  const d = new Date(String(dateStr).trim().substring(0, 10))
  if (isNaN(d.getTime())) return '-'
  return d.toDateString().substring(4, 15)
}

// Compute seat left value
export function computeSeatLeft(course: NormalizedCourse): number | null {
  const L = Number(course.seatLimit)
  const U = Number(course.seatUsed)
  const R = Number(course.seatLeft)
  
  if (Number.isFinite(R)) return Math.max(0, R)
  if (Number.isFinite(L) && Number.isFinite(U)) return Math.max(0, L - U)
  return null
}

// Duration in minutes
export function getDuration(course: NormalizedCourse): number {
  const s = toMinutes(course.start) || 0
  const e = toMinutes(course.end) || 0
  return e - s
}
