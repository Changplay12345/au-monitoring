// User types
export interface User {
  id: string
  username: string
  email: string
  name: string | null
  role: 'admin' | 'user'
  avatar_url?: string | null
  auth_provider?: 'google' | 'facebook' | 'email' | null
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Course types (from data_vme table)
export interface Course {
  id?: string
  "Course Code": string
  "Course Title": string
  "Prefix": string
  "Section": string
  "Start Time": string
  "End Time": string
  "Instructor Name": string
  "Session": string
  "Day": string
  "Day Number": number
  "Remark": string
  "Seat Limit": number
  "Seat Used": number
  "Seat Left": number
  "Midterm Date"?: string
  "Midterm Start"?: string
  "Midterm End"?: string
  "Final Date"?: string
  "Final Start"?: string
  "Final End"?: string
}

// Normalized course for internal use
export interface NormalizedCourse {
  code: string
  title: string
  prefix: string
  section: string
  start: string
  end: string
  instructor: string
  session: string
  day: string
  dayNum: number
  remark: string
  seatLimit: number | null
  seatUsed: number | null
  seatLeft: number | null
  midtermDate?: string
  midtermStart?: string
  midtermEnd?: string
  finalDate?: string
  finalStart?: string
  finalEnd?: string
}

// Course group for overlap handling
export interface CourseGroup {
  min: number
  max: number
  items: NormalizedCourse[]
  visibleIndex: number
}

// Filter state
export interface FilterState {
  search: string
  session: 'ALL' | 'Morning' | 'Afternoon'
  activeDay: string
}

// Registration types
export interface Registration {
  id: string
  user_id: string
  class_id: string
  created_at: string
}

// Seat status
export type SeatStatus = 'green' | 'warn' | 'full' | null

// Days of the week
export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

export type DayOfWeek = typeof DAYS[number]

// Prefix color mapping
export const PREFIX_COLORS: Record<string, string> = {
  AE: 'bg-pink-500',
  EE: 'bg-blue-500',
  ITX: 'bg-red-500',
  CSX: 'bg-green-500',
  CE: 'bg-orange-500',
  ME: 'bg-amber-700',
  EG: 'bg-teal-500',
  MCE: 'bg-yellow-500',
  IE: 'bg-gray-500',
}
