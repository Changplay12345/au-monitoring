'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
  Eye,
} from 'lucide-react'

type AlertLevel = 'full' | 'almost_full' | 'filling' | 'available'

interface CourseAlert {
  id: string
  courseCode: string
  courseTitle: string
  section: string
  seatUsed: number
  seatLimit: number
  seatLeft: number
  level: AlertLevel
  timestamp: string
  day: string
  time: string
  instructor: string
  prefix: string
  trend: 'up' | 'stable' | 'down'
}

const mockAlerts: CourseAlert[] = [
  { id: '1', courseCode: 'CSX3003', courseTitle: 'Data Structures & Algorithms', section: '001', seatUsed: 40, seatLimit: 40, seatLeft: 0, level: 'full', timestamp: '2 min ago', day: 'Mon', time: '09:00-10:30', instructor: 'Dr. Somchai', prefix: 'CSX', trend: 'up' },
  { id: '2', courseCode: 'ITX2107', courseTitle: 'Database Management', section: '002', seatUsed: 38, seatLimit: 40, seatLeft: 2, level: 'almost_full', timestamp: '5 min ago', day: 'Tue', time: '13:00-14:30', instructor: 'Dr. Wichai', prefix: 'ITX', trend: 'up' },
  { id: '3', courseCode: 'EE2201', courseTitle: 'Circuit Analysis', section: '001', seatUsed: 25, seatLimit: 25, seatLeft: 0, level: 'full', timestamp: '12 min ago', day: 'Wed', time: '10:00-11:30', instructor: 'Prof. Johnson', prefix: 'EE', trend: 'stable' },
  { id: '4', courseCode: 'CSX3001', courseTitle: 'Computer Programming', section: '003', seatUsed: 28, seatLimit: 30, seatLeft: 2, level: 'almost_full', timestamp: '18 min ago', day: 'Mon', time: '13:00-14:30', instructor: 'Dr. Prasert', prefix: 'CSX', trend: 'up' },
  { id: '5', courseCode: 'GE1401', courseTitle: 'English Communication', section: '005', seatUsed: 43, seatLimit: 50, seatLeft: 7, level: 'filling', timestamp: '25 min ago', day: 'Thu', time: '08:00-09:30', instructor: 'Ms. Linda', prefix: 'GE', trend: 'up' },
  { id: '6', courseCode: 'MA2001', courseTitle: 'Calculus II', section: '001', seatUsed: 35, seatLimit: 40, seatLeft: 5, level: 'filling', timestamp: '30 min ago', day: 'Fri', time: '10:00-11:30', instructor: 'Dr. Napat', prefix: 'MA', trend: 'stable' },
  { id: '7', courseCode: 'CSX4002', courseTitle: 'Software Engineering', section: '001', seatUsed: 20, seatLimit: 35, seatLeft: 15, level: 'available', timestamp: '45 min ago', day: 'Tue', time: '15:00-16:30', instructor: 'Dr. Apinya', prefix: 'CSX', trend: 'down' },
  { id: '8', courseCode: 'ITX3005', courseTitle: 'Computer Networks', section: '002', seatUsed: 30, seatLimit: 30, seatLeft: 0, level: 'full', timestamp: '1 hr ago', day: 'Wed', time: '13:00-14:30', instructor: 'Dr. Tanawat', prefix: 'ITX', trend: 'stable' },
]

const prefixColors: Record<string, string> = {
  CSX: 'bg-green-500',
  ITX: 'bg-red-500',
  EE: 'bg-blue-500',
  GE: 'bg-purple-500',
  MA: 'bg-amber-700',
}

export default function Demo3() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const fullCount = mockAlerts.filter(a => a.level === 'full').length
  const almostFullCount = mockAlerts.filter(a => a.level === 'almost_full').length
  const fillingCount = mockAlerts.filter(a => a.level === 'filling').length
  const totalCourses = mockAlerts.length

  const stats = [
    { label: 'Total Alerts', value: totalCourses, icon: Bell, color: 'bg-gray-800', textColor: 'text-gray-800' },
    { label: 'Full Courses', value: fullCount, icon: XCircle, color: 'bg-red-600', textColor: 'text-red-600' },
    { label: 'Almost Full', value: almostFullCount, icon: AlertTriangle, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { label: 'Filling Up', value: fillingCount, icon: TrendingUp, color: 'bg-amber-500', textColor: 'text-amber-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Notification Dashboard</h2>
          <p className="text-xs text-gray-500">Course seat availability overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={cn('text-3xl font-bold', stat.textColor)}>{stat.value}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-600" />
          Seat Occupancy Overview
        </h3>
        <div className="space-y-3">
          {mockAlerts.map(alert => {
            const fillPercent = (alert.seatUsed / alert.seatLimit) * 100
            return (
              <div key={alert.id} className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono font-bold text-gray-700 truncate">{alert.courseCode}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-400' : fillPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                    )}
                    style={{ width: `${Math.min(fillPercent, 100)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {Math.round(fillPercent)}%
                  </span>
                </div>
                <span className="w-14 text-xs font-mono text-gray-500 text-right">{alert.seatUsed}/{alert.seatLimit}</span>
              </div>
            )
          })}
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-red-600" />
        Alert Cards
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAlerts.map(alert => {
          const fillPercent = (alert.seatUsed / alert.seatLimit) * 100
          const isHovered = hoveredCard === alert.id

          return (
            <div
              key={alert.id}
              onMouseEnter={() => setHoveredCard(alert.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={cn(
                'bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer',
                alert.level === 'full' ? 'border-red-200 hover:border-red-400' :
                alert.level === 'almost_full' ? 'border-orange-200 hover:border-orange-400' :
                alert.level === 'filling' ? 'border-amber-200 hover:border-amber-400' :
                'border-gray-200 hover:border-gray-300',
                'hover:shadow-lg',
              )}
            >
              <div className={cn(
                'h-1.5',
                alert.level === 'full' ? 'bg-red-500' :
                alert.level === 'almost_full' ? 'bg-orange-500' :
                alert.level === 'filling' ? 'bg-amber-400' : 'bg-emerald-400'
              )} />

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', prefixColors[alert.prefix] || 'bg-gray-400')} />
                    <span className="font-bold text-gray-800 text-sm">{alert.courseCode}</span>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold text-white',
                    alert.level === 'full' ? 'bg-red-600' :
                    alert.level === 'almost_full' ? 'bg-orange-500' :
                    alert.level === 'filling' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}>
                    {alert.level === 'full' ? 'FULL' : alert.level === 'almost_full' ? 'ALMOST FULL' : alert.level === 'filling' ? 'FILLING' : 'OPEN'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-3 truncate">{alert.courseTitle}</p>

                <div className="flex items-end justify-between">
                  <div className="flex-1 mr-4">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-400' : fillPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                        )}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{alert.seatUsed} enrolled</span>
                      <span>{alert.seatLeft} left</span>
                    </div>
                  </div>

                  <div className={cn(
                    'text-center min-w-[44px] py-1.5 px-2 rounded-lg',
                    alert.seatLeft === 0 ? 'bg-red-50' : alert.seatLeft <= 3 ? 'bg-orange-50' : 'bg-gray-50'
                  )}>
                    <Users className={cn(
                      'w-3.5 h-3.5 mx-auto mb-0.5',
                      alert.seatLeft === 0 ? 'text-red-400' : alert.seatLeft <= 3 ? 'text-orange-400' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'text-sm font-bold block',
                      alert.seatLeft === 0 ? 'text-red-600' : alert.seatLeft <= 3 ? 'text-orange-600' : 'text-gray-700'
                    )}>
                      {alert.seatLeft}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span>{alert.day} {alert.time}</span>
                  <span>{alert.instructor}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
