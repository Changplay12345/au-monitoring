'use client'

import { useState } from 'react'
import { CourseBlock } from './CourseBlock'
import { CourseDetail } from './CourseDetail'
import { NormalizedCourse, DAYS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { RefreshCw, Search } from 'lucide-react'

// Mock data for testing
const mockCourses: NormalizedCourse[] = [
  {
    code: 'CS101',
    title: 'Introduction to Programming',
    prefix: 'CSX',
    section: '001',
    start: '08:00',
    end: '09:30',
    instructor: 'Dr. Smith',
    session: 'Morning',
    day: 'Monday',
    dayNum: 1,
    remark: 'Lab required',
    seatLimit: 30,
    seatUsed: 25,
    seatLeft: 5,
  },
  {
    code: 'EE201',
    title: 'Circuit Analysis',
    prefix: 'EE',
    section: '002',
    start: '10:00',
    end: '11:30',
    instructor: 'Prof. Johnson',
    session: 'Morning',
    day: 'Monday',
    dayNum: 1,
    remark: 'None',
    seatLimit: 25,
    seatUsed: 25,
    seatLeft: 0,
  },
  {
    code: 'AE301',
    title: 'Aerodynamics',
    prefix: 'AE',
    section: '001',
    start: '13:00',
    end: '14:30',
    instructor: 'Dr. Wilson',
    session: 'Afternoon',
    day: 'Tuesday',
    dayNum: 2,
    remark: 'Prerequisite: ME101',
    seatLimit: 20,
    seatUsed: 15,
    seatLeft: 5,
  },
]

// Time axis configuration
const START_MIN = 7 * 60 + 30  // 07:30
const STEP_MIN = 90            // 1.5 hours
const CELLS = 10               // number of columns
const END_MIN = START_MIN + CELLS * STEP_MIN  // 22:30
const SPAN_MIN = END_MIN - START_MIN

export function CourseGridSimple() {
  const [search, setSearch] = useState('')
  const [session, setSession] = useState<'ALL' | 'Morning' | 'Afternoon'>('ALL')
  const [activeDay, setActiveDay] = useState('ALL')
  const [detailCourses, setDetailCourses] = useState<NormalizedCourse[]>([])

  // Filter mock courses
  const filteredCourses = mockCourses.filter(course => {
    const q = search.trim().toLowerCase()
    const code = course.code.toLowerCase()
    const prefix = course.prefix.toLowerCase()
    const okQ = !q || code.startsWith(q) || prefix === q
    const okS = session === 'ALL' || course.session === session
    const okD = activeDay === 'ALL' || course.day === activeDay
    return okQ && okS && okD
  })

  // Group by day
  const groupedByDay: Record<string, any[]> = {}
  DAYS.forEach(day => {
    groupedByDay[day] = filteredCourses
      .filter(course => course.day === day)
      .map(course => ({
        min: 0,
        max: 90,
        items: [course],
        visibleIndex: 0,
      }))
  })

  // Generate time ruler ticks
  const ticks = Array.from({ length: CELLS + 1 }, (_, i) => {
    const t = START_MIN + i * STEP_MIN
    const h = String(Math.floor(t / 60)).padStart(2, '0')
    const m = String(t % 60).padStart(2, '0')
    const x = ((t - START_MIN) / SPAN_MIN) * 100
    return { time: `${h}:${m}`, x, isLast: i === CELLS }
  })

  // Handle course click
  const handleCourseClick = (course: NormalizedCourse) => {
    const key = `${course.code}-${course.section}-${course.day}-${course.start}`
    if (!detailCourses.find(c => 
      `${c.code}-${c.section}-${c.day}-${c.start}` === key
    )) {
      setDetailCourses(prev => [course, ...prev])
    }
  }

  // Remove course from detail list
  const handleRemoveDetail = (course: NormalizedCourse) => {
    const key = `${course.code}-${course.section}-${course.day}-${course.start}`
    setDetailCourses(prev => prev.filter(c => 
      `${c.code}-${c.section}-${c.day}-${c.start}` !== key
    ))
  }

  const hasAnyCourses = Object.values(groupedByDay).some(groups => groups.length > 0)

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6">
      {/* Header with filters */}
      <header className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        {/* Day tabs */}
        <nav className="flex gap-1 border border-red-600 rounded-xl p-1 bg-white">
          <button
            onClick={() => setActiveDay('ALL')}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeDay === 'ALL'
                ? 'bg-red-600 text-white'
                : 'text-red-600 hover:bg-red-50'
            )}
          >
            ALL
          </button>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeDay === day
                  ? 'bg-red-600 text-white'
                  : 'text-red-600 hover:bg-red-50'
              )}
            >
              {day.slice(0, 1)}
            </button>
          ))}
        </nav>

        {/* Tools */}
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search course code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as 'ALL' | 'Morning' | 'Afternoon')}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Session: ALL</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        </div>
      </header>

      {/* Time ruler */}
      <div className="relative ml-[70px] h-5 mb-2">
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute top-0 -translate-x-1/2 text-xs text-gray-500 font-semibold"
            style={{ left: `${tick.x}%` }}
          >
            {!tick.isLast && tick.time}
            <div className="w-px h-3 bg-gray-200 mx-auto mt-1" />
          </div>
        ))}
      </div>

      {/* Grid */}
      <main className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
        {DAYS.map((day, idx) => {
          const groups = groupedByDay[day] || []
          
          return (
            <div
              key={day}
              className={cn(
                'relative h-[72px]',
                idx > 0 && 'border-t border-gray-200'
              )}
            >
              {/* Day label */}
              <div className="absolute left-0 top-0 bottom-0 w-[70px] flex items-center justify-center font-semibold text-gray-500 bg-white border-r border-gray-200">
                {day.slice(0, 3).toUpperCase()}
              </div>

              {/* Lane */}
              <div 
                className="absolute left-[70px] right-0 top-0 bottom-0"
                style={{
                  backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: `${100 / CELLS}% 100%`,
                }}
              >
                {groups.map((group, gIdx) => (
                  <CourseBlock
                    key={gIdx}
                    group={group}
                    startMin={START_MIN}
                    spanMin={SPAN_MIN}
                    isDimmed={activeDay !== 'ALL' && day !== activeDay}
                    onCourseClick={handleCourseClick}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </main>

      {/* Empty state */}
      {!hasAnyCourses && (
        <p className="text-center text-gray-400 mt-6">No classes found.</p>
      )}

      {/* Detail cards */}
      {detailCourses.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {detailCourses.map((course, idx) => (
            <CourseDetail
              key={`${course.code}-${course.section}-${course.day}-${course.start}-${idx}`}
              course={course}
              onClose={() => handleRemoveDetail(course)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
