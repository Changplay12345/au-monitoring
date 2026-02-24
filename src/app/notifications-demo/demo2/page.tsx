'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react'

type AlertLevel = 'full' | 'almost_full' | 'filling' | 'available'

interface TimelineAlert {
  id: string
  courseCode: string
  courseTitle: string
  section: string
  seatUsed: number
  seatLimit: number
  seatLeft: number
  level: AlertLevel
  timestamp: string
  timeAgo: string
  day: string
  time: string
  instructor: string
  message: string
}

const mockAlerts: TimelineAlert[] = [
  { id: '1', courseCode: 'CSX3003', courseTitle: 'Data Structures and Algorithms', section: '001', seatUsed: 40, seatLimit: 40, seatLeft: 0, level: 'full', timestamp: '14:32', timeAgo: '2 min ago', day: 'Monday', time: '09:00-10:30', instructor: 'Dr. Somchai', message: 'This course has reached maximum capacity. No seats remaining.' },
  { id: '2', courseCode: 'ITX2107', courseTitle: 'Database Management Systems', section: '002', seatUsed: 38, seatLimit: 40, seatLeft: 2, level: 'almost_full', timestamp: '14:27', timeAgo: '7 min ago', day: 'Tuesday', time: '13:00-14:30', instructor: 'Dr. Wichai', message: 'Only 2 seats remaining. Course is filling up rapidly.' },
  { id: '3', courseCode: 'EE2201', courseTitle: 'Circuit Analysis', section: '001', seatUsed: 25, seatLimit: 25, seatLeft: 0, level: 'full', timestamp: '14:20', timeAgo: '14 min ago', day: 'Wednesday', time: '10:00-11:30', instructor: 'Prof. Johnson', message: 'Course is now completely full. Consider alternative sections.' },
  { id: '4', courseCode: 'CSX3001', courseTitle: 'Computer Programming', section: '003', seatUsed: 28, seatLimit: 30, seatLeft: 2, level: 'almost_full', timestamp: '14:15', timeAgo: '19 min ago', day: 'Monday', time: '13:00-14:30', instructor: 'Dr. Prasert', message: '2 seats left out of 30. Register soon to secure your spot.' },
  { id: '5', courseCode: 'GE1401', courseTitle: 'English for Communication', section: '005', seatUsed: 43, seatLimit: 50, seatLeft: 7, level: 'filling', timestamp: '14:08', timeAgo: '26 min ago', day: 'Thursday', time: '08:00-09:30', instructor: 'Ms. Linda', message: 'Course has 86% occupancy and is trending upward.' },
  { id: '6', courseCode: 'MA2001', courseTitle: 'Calculus II', section: '001', seatUsed: 35, seatLimit: 40, seatLeft: 5, level: 'filling', timestamp: '14:02', timeAgo: '32 min ago', day: 'Friday', time: '10:00-11:30', instructor: 'Dr. Napat', message: '5 seats remaining. Enrollment rate is increasing.' },
  { id: '7', courseCode: 'CSX4002', courseTitle: 'Software Engineering', section: '001', seatUsed: 20, seatLimit: 35, seatLeft: 15, level: 'available', timestamp: '13:48', timeAgo: '46 min ago', day: 'Tuesday', time: '15:00-16:30', instructor: 'Dr. Apinya', message: 'Plenty of seats available. 15 seats open.' },
]

const levelConfig = {
  full: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-600', ring: 'ring-red-200', dotBg: 'bg-red-600', label: 'FULL', lineColor: 'bg-red-300' },
  almost_full: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-500', ring: 'ring-orange-200', dotBg: 'bg-orange-500', label: 'Almost Full', lineColor: 'bg-orange-300' },
  filling: { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-200', dotBg: 'bg-amber-500', label: 'Filling Up', lineColor: 'bg-amber-300' },
  available: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', dotBg: 'bg-emerald-500', label: 'Available', lineColor: 'bg-emerald-300' },
}

export default function Demo2() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Live Course Alerts</h2>
          <p className="text-xs text-gray-500">Real-time seat availability timeline</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 mt-4 text-xs">
        {(['full', 'almost_full', 'filling', 'available'] as const).map(level => {
          const config = levelConfig[level]
          const count = mockAlerts.filter(a => a.level === level).length
          return (
            <div key={level} className="flex items-center gap-1.5">
              <span className={cn('w-2.5 h-2.5 rounded-full', config.dotBg)} />
              <span className="text-gray-600 font-medium">{config.label}</span>
              <span className="text-gray-400">({count})</span>
            </div>
          )
        })}
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-0">
          {mockAlerts.map((alert, idx) => {
            const config = levelConfig[alert.level]
            const Icon = config.icon
            const isSelected = selectedAlert === alert.id
            const fillPercent = (alert.seatUsed / alert.seatLimit) * 100

            return (
              <div key={alert.id} className="relative pl-14 pb-8 group">
                <div className={cn(
                  'absolute left-[14px] top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ring-4 ring-white',
                  config.bg,
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>

                {idx < mockAlerts.length - 1 && (
                  <div className={cn('absolute left-[23px] top-7 w-0.5 h-[calc(100%-28px)]', config.lineColor)} style={{ opacity: 0.5 }} />
                )}

                <div
                  onClick={() => setSelectedAlert(isSelected ? null : alert.id)}
                  className={cn(
                    'bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200',
                    isSelected ? 'shadow-lg border-gray-300 scale-[1.01]' : 'shadow-sm border-gray-200 hover:shadow-md hover:border-gray-300',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{alert.courseCode}</span>
                      <span className="text-xs text-gray-400">Sec {alert.section}</span>
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold text-white', config.bg)}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{alert.courseTitle}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Seat Occupancy</span>
                        <span className="font-mono font-bold text-gray-700">{alert.seatUsed}/{alert.seatLimit}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-500' : fillPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className={cn(
                      'w-12 h-12 rounded-xl flex flex-col items-center justify-center',
                      alert.seatLeft === 0 ? 'bg-red-100' : alert.seatLeft <= 3 ? 'bg-orange-100' : 'bg-gray-100'
                    )}>
                      <span className={cn(
                        'text-lg font-bold',
                        alert.seatLeft === 0 ? 'text-red-600' : alert.seatLeft <= 3 ? 'text-orange-600' : 'text-gray-700'
                      )}>
                        {alert.seatLeft}
                      </span>
                      <span className="text-[9px] text-gray-400 -mt-1">left</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 italic mb-3">{alert.message}</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-400 text-[10px] mb-0.5">Day</p>
                          <p className="font-semibold text-gray-700">{alert.day}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-400 text-[10px] mb-0.5">Time</p>
                          <p className="font-semibold text-gray-700">{alert.time}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-400 text-[10px] mb-0.5">Instructor</p>
                          <p className="font-semibold text-gray-700 truncate">{alert.instructor}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
