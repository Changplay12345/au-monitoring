'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  SortAsc,
  SortDesc,
} from 'lucide-react'

type AlertLevel = 'full' | 'almost_full' | 'filling' | 'available'
type SortField = 'time' | 'seats' | 'code'

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
}

const mockAlerts: CourseAlert[] = [
  { id: '1', courseCode: 'CSX3003', courseTitle: 'Data Structures and Algorithms', section: '001', seatUsed: 40, seatLimit: 40, seatLeft: 0, level: 'full', timestamp: '14:32', day: 'Monday', time: '09:00-10:30', instructor: 'Dr. Somchai' },
  { id: '2', courseCode: 'EE2201', courseTitle: 'Circuit Analysis', section: '001', seatUsed: 25, seatLimit: 25, seatLeft: 0, level: 'full', timestamp: '14:20', day: 'Wednesday', time: '10:00-11:30', instructor: 'Prof. Johnson' },
  { id: '3', courseCode: 'ITX3005', courseTitle: 'Computer Networks', section: '002', seatUsed: 30, seatLimit: 30, seatLeft: 0, level: 'full', timestamp: '13:48', day: 'Wednesday', time: '13:00-14:30', instructor: 'Dr. Tanawat' },
  { id: '4', courseCode: 'ITX2107', courseTitle: 'Database Management Systems', section: '002', seatUsed: 38, seatLimit: 40, seatLeft: 2, level: 'almost_full', timestamp: '14:27', day: 'Tuesday', time: '13:00-14:30', instructor: 'Dr. Wichai' },
  { id: '5', courseCode: 'CSX3001', courseTitle: 'Computer Programming', section: '003', seatUsed: 28, seatLimit: 30, seatLeft: 2, level: 'almost_full', timestamp: '14:15', day: 'Monday', time: '13:00-14:30', instructor: 'Dr. Prasert' },
  { id: '6', courseCode: 'GE1401', courseTitle: 'English for Communication', section: '005', seatUsed: 43, seatLimit: 50, seatLeft: 7, level: 'filling', timestamp: '14:08', day: 'Thursday', time: '08:00-09:30', instructor: 'Ms. Linda' },
  { id: '7', courseCode: 'MA2001', courseTitle: 'Calculus II', section: '001', seatUsed: 35, seatLimit: 40, seatLeft: 5, level: 'filling', timestamp: '14:02', day: 'Friday', time: '10:00-11:30', instructor: 'Dr. Napat' },
  { id: '8', courseCode: 'CSX4002', courseTitle: 'Software Engineering', section: '001', seatUsed: 20, seatLimit: 35, seatLeft: 15, level: 'available', timestamp: '13:48', day: 'Tuesday', time: '15:00-16:30', instructor: 'Dr. Apinya' },
]

const groupConfig = {
  full: { label: 'Full - No Seats Available', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', headerBg: 'bg-red-600', borderColor: 'border-red-200' },
  almost_full: { label: 'Almost Full - Act Now', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', headerBg: 'bg-orange-500', borderColor: 'border-orange-200' },
  filling: { label: 'Filling Up - Monitor', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', headerBg: 'bg-amber-500', borderColor: 'border-amber-200' },
  available: { label: 'Available', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', headerBg: 'bg-emerald-500', borderColor: 'border-emerald-200' },
}

const groupOrder: AlertLevel[] = ['full', 'almost_full', 'filling', 'available']

export default function Demo4() {
  const [expandedGroups, setExpandedGroups] = useState<Set<AlertLevel>>(new Set(groupOrder))
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('time')
  const [sortAsc, setSortAsc] = useState(true)

  const toggleGroup = (level: AlertLevel) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const sortAlerts = (alerts: CourseAlert[]) => {
    return [...alerts].sort((a, b) => {
      let cmp = 0
      if (sortField === 'code') cmp = a.courseCode.localeCompare(b.courseCode)
      else if (sortField === 'seats') cmp = a.seatLeft - b.seatLeft
      else cmp = a.timestamp.localeCompare(b.timestamp)
      return sortAsc ? cmp : -cmp
    })
  }

  const SortIcon = sortAsc ? SortAsc : SortDesc

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Course Alerts by Priority</h2>
            <p className="text-xs text-gray-500">Grouped by urgency level with sortable columns</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([['time', 'Time'], ['code', 'Code'], ['seats', 'Seats']] as [SortField, string][]).map(([field, label]) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1',
                sortField === field ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
              {sortField === field && <SortIcon className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {groupOrder.map(level => {
          const config = groupConfig[level]
          const Icon = config.icon
          const alerts = sortAlerts(mockAlerts.filter(a => a.level === level))
          const isExpanded = expandedGroups.has(level)

          if (alerts.length === 0) return null

          return (
            <div key={level} className={cn('border rounded-xl overflow-hidden', config.borderColor)}>
              <button
                onClick={() => toggleGroup(level)}
                className={cn('w-full flex items-center justify-between px-5 py-3 transition-colors', config.headerBg)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-sm">{config.label}</span>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
                </div>
                <ChevronRight className={cn('w-5 h-5 text-white transition-transform', isExpanded && 'rotate-90')} />
              </button>

              {isExpanded && (
                <div className="bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className={cn('text-xs text-gray-500', config.bg)}>
                        <th className="text-left px-5 py-2.5 font-semibold">Course</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Section</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Schedule</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Instructor</th>
                        <th className="text-center px-3 py-2.5 font-semibold">Seats</th>
                        <th className="text-center px-3 py-2.5 font-semibold">Status</th>
                        <th className="text-right px-5 py-2.5 font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert, idx) => {
                        const fillPercent = (alert.seatUsed / alert.seatLimit) * 100
                        const isSelected = selectedRow === alert.id
                        return (
                          <tr
                            key={alert.id}
                            onClick={() => setSelectedRow(isSelected ? null : alert.id)}
                            className={cn(
                              'cursor-pointer transition-colors text-sm',
                              isSelected ? config.bg : 'hover:bg-gray-50',
                              idx < alerts.length - 1 && 'border-b border-gray-100'
                            )}
                          >
                            <td className="px-5 py-3">
                              <div>
                                <span className="font-bold text-gray-800">{alert.courseCode}</span>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{alert.courseTitle}</p>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-gray-600">{alert.section}</td>
                            <td className="px-3 py-3 text-xs text-gray-600">
                              <span className="font-medium">{alert.day}</span>
                              <br />
                              <span className="text-gray-400">{alert.time}</span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-600">{alert.instructor}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-mono font-bold text-gray-700">{alert.seatUsed}/{alert.seatLimit}</span>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-400' : fillPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                                    )}
                                    style={{ width: `${Math.min(fillPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold',
                                alert.seatLeft === 0 ? 'bg-red-100 text-red-700' :
                                alert.seatLeft <= 3 ? 'bg-orange-100 text-orange-700' :
                                alert.seatLeft <= 10 ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              )}>
                                {alert.seatLeft === 0 ? 'No seats' : `${alert.seatLeft} left`}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-xs text-gray-400">{alert.timestamp}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Total: <strong className="text-gray-700">{mockAlerts.length}</strong> courses monitored</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {mockAlerts.filter(a => a.level === 'full').length} full</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> {mockAlerts.filter(a => a.level === 'almost_full').length} almost full</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {mockAlerts.filter(a => a.level === 'filling').length} filling</span>
        </div>
        <span className="text-[10px] text-gray-400">Last updated: just now</span>
      </div>
    </div>
  )
}
