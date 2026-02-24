'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react'

type AlertLevel = 'full' | 'almost_full' | 'filling' | 'available'

interface Notification {
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
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: '1', courseCode: 'CSX3003', courseTitle: 'Data Structures and Algorithms', section: '001', seatUsed: 40, seatLimit: 40, seatLeft: 0, level: 'full', timestamp: '2 min ago', day: 'Monday', time: '09:00-10:30', instructor: 'Dr. Somchai', read: false },
  { id: '2', courseCode: 'ITX2107', courseTitle: 'Database Management Systems', section: '002', seatUsed: 38, seatLimit: 40, seatLeft: 2, level: 'almost_full', timestamp: '5 min ago', day: 'Tuesday', time: '13:00-14:30', instructor: 'Dr. Wichai', read: false },
  { id: '3', courseCode: 'EE2201', courseTitle: 'Circuit Analysis', section: '001', seatUsed: 25, seatLimit: 25, seatLeft: 0, level: 'full', timestamp: '12 min ago', day: 'Wednesday', time: '10:00-11:30', instructor: 'Prof. Johnson', read: false },
  { id: '4', courseCode: 'CSX3001', courseTitle: 'Computer Programming', section: '003', seatUsed: 28, seatLimit: 30, seatLeft: 2, level: 'almost_full', timestamp: '18 min ago', day: 'Monday', time: '13:00-14:30', instructor: 'Dr. Prasert', read: true },
  { id: '5', courseCode: 'GE1401', courseTitle: 'English for Communication', section: '005', seatUsed: 43, seatLimit: 50, seatLeft: 7, level: 'filling', timestamp: '25 min ago', day: 'Thursday', time: '08:00-09:30', instructor: 'Ms. Linda', read: true },
  { id: '6', courseCode: 'MA2001', courseTitle: 'Calculus II', section: '001', seatUsed: 35, seatLimit: 40, seatLeft: 5, level: 'filling', timestamp: '30 min ago', day: 'Friday', time: '10:00-11:30', instructor: 'Dr. Napat', read: true },
  { id: '7', courseCode: 'CSX4002', courseTitle: 'Software Engineering', section: '001', seatUsed: 20, seatLimit: 35, seatLeft: 15, level: 'available', timestamp: '45 min ago', day: 'Tuesday', time: '15:00-16:30', instructor: 'Dr. Apinya', read: true },
  { id: '8', courseCode: 'ITX3005', courseTitle: 'Computer Networks', section: '002', seatUsed: 30, seatLimit: 30, seatLeft: 0, level: 'full', timestamp: '1 hr ago', day: 'Wednesday', time: '13:00-14:30', instructor: 'Dr. Tanawat', read: true },
]

const levelConfig = {
  full: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600', label: 'FULL' },
  almost_full: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', label: 'Almost Full' },
  filling: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', label: 'Filling Up' },
  available: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', label: 'Available' },
}

export default function Demo1() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<AlertLevel | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = notifications.filter(n => filter === 'all' || n.level === filter)
  const unreadCount = notifications.filter(n => !n.read).length

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Course Alerts</h2>
            <p className="text-xs text-gray-500">{filtered.length} notifications</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-red-600 hover:text-red-700 font-medium">
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(['all', 'full', 'almost_full', 'filling', 'available'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
              filter === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
            )}
          >
            {f === 'all' ? 'All' : levelConfig[f].label}
            {f === 'full' && <span className="ml-1 text-[10px]">({notifications.filter(n => n.level === 'full').length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n, idx) => {
          const config = levelConfig[n.level]
          const Icon = config.icon
          const isExpanded = expanded === n.id
          const fillPercent = (n.seatUsed / n.seatLimit) * 100

          return (
            <div
              key={n.id}
              onClick={() => { markRead(n.id); setExpanded(isExpanded ? null : n.id) }}
              className={cn(
                'relative border rounded-xl p-4 cursor-pointer transition-all duration-300',
                config.bg, config.border,
                !n.read && 'ring-2 ring-red-400/30',
                'hover:shadow-md'
              )}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {!n.read && (
                <span className="absolute top-4 right-12 w-2.5 h-2.5 bg-red-600 rounded-full" />
              )}

              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5 p-2 rounded-lg', config.bg)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-sm">{n.courseCode}</span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold text-white', config.badge)}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto mr-6">{n.timestamp}</span>
                  </div>

                  <p className="text-sm text-gray-700 truncate">{n.courseTitle} - Sec {n.section}</p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-500' : fillPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700 whitespace-nowrap">
                      {n.seatUsed}/{n.seatLimit}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200/50 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <p><span className="font-semibold text-gray-700">Day:</span> {n.day}</p>
                      <p><span className="font-semibold text-gray-700">Time:</span> {n.time}</p>
                      <p><span className="font-semibold text-gray-700">Instructor:</span> {n.instructor}</p>
                      <p><span className="font-semibold text-gray-700">Seats Left:</span> <span className={config.color}>{n.seatLeft}</span></p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center mt-1">
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No notifications in this category</p>
        </div>
      )}
    </div>
  )
}
