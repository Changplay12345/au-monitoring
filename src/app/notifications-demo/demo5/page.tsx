'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  Trash2,
  Archive,
  CheckCheck,
} from 'lucide-react'

type AlertLevel = 'full' | 'almost_full' | 'filling' | 'available'
type Tab = 'all' | 'unread' | 'archived'

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
  archived: boolean
}

const initial: Notification[] = [
  { id: '1', courseCode: 'CSX3003', courseTitle: 'Data Structures and Algorithms', section: '001', seatUsed: 40, seatLimit: 40, seatLeft: 0, level: 'full', timestamp: '2 min ago', day: 'Monday', time: '09:00', instructor: 'Dr. Somchai', read: false, archived: false },
  { id: '2', courseCode: 'ITX2107', courseTitle: 'Database Management Systems', section: '002', seatUsed: 38, seatLimit: 40, seatLeft: 2, level: 'almost_full', timestamp: '5 min ago', day: 'Tuesday', time: '13:00', instructor: 'Dr. Wichai', read: false, archived: false },
  { id: '3', courseCode: 'EE2201', courseTitle: 'Circuit Analysis', section: '001', seatUsed: 25, seatLimit: 25, seatLeft: 0, level: 'full', timestamp: '12 min ago', day: 'Wednesday', time: '10:00', instructor: 'Prof. Johnson', read: false, archived: false },
  { id: '4', courseCode: 'CSX3001', courseTitle: 'Computer Programming', section: '003', seatUsed: 28, seatLimit: 30, seatLeft: 2, level: 'almost_full', timestamp: '18 min ago', day: 'Monday', time: '13:00', instructor: 'Dr. Prasert', read: true, archived: false },
  { id: '5', courseCode: 'GE1401', courseTitle: 'English for Communication', section: '005', seatUsed: 43, seatLimit: 50, seatLeft: 7, level: 'filling', timestamp: '25 min ago', day: 'Thursday', time: '08:00', instructor: 'Ms. Linda', read: true, archived: false },
  { id: '6', courseCode: 'MA2001', courseTitle: 'Calculus II', section: '001', seatUsed: 35, seatLimit: 40, seatLeft: 5, level: 'filling', timestamp: '30 min ago', day: 'Friday', time: '10:00', instructor: 'Dr. Napat', read: true, archived: false },
  { id: '7', courseCode: 'CSX4002', courseTitle: 'Software Engineering', section: '001', seatUsed: 20, seatLimit: 35, seatLeft: 15, level: 'available', timestamp: '45 min ago', day: 'Tuesday', time: '15:00', instructor: 'Dr. Apinya', read: true, archived: false },
  { id: '8', courseCode: 'ITX3005', courseTitle: 'Computer Networks', section: '002', seatUsed: 30, seatLimit: 30, seatLeft: 0, level: 'full', timestamp: '1 hr ago', day: 'Wednesday', time: '13:00', instructor: 'Dr. Tanawat', read: true, archived: false },
  { id: '9', courseCode: 'AE3001', courseTitle: 'Aerodynamics I', section: '001', seatUsed: 18, seatLimit: 20, seatLeft: 2, level: 'almost_full', timestamp: '1.5 hr ago', day: 'Thursday', time: '10:00', instructor: 'Dr. Piyawat', read: true, archived: true },
]

const levelConfig = {
  full: { icon: XCircle, dotColor: 'bg-red-500', textColor: 'text-red-600', label: 'Full' },
  almost_full: { icon: AlertTriangle, dotColor: 'bg-orange-500', textColor: 'text-orange-600', label: 'Almost Full' },
  filling: { icon: TrendingUp, dotColor: 'bg-amber-500', textColor: 'text-amber-600', label: 'Filling Up' },
  available: { icon: CheckCircle, dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', label: 'Available' },
}

export default function Demo5() {
  const [notifications, setNotifications] = useState(initial)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    const visible = getFiltered().map(n => n.id)
    const allSelected = visible.every(id => selected.has(id))
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(visible))
  }

  const markSelectedRead = () => {
    setNotifications(prev => prev.map(n => selected.has(n.id) ? { ...n, read: true } : n))
    setSelected(new Set())
  }

  const archiveSelected = () => {
    setNotifications(prev => prev.map(n => selected.has(n.id) ? { ...n, archived: true, read: true } : n))
    setSelected(new Set())
  }

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selected.has(n.id)))
    setSelected(new Set())
  }

  const getFiltered = () => {
    let list = notifications
    if (tab === 'unread') list = list.filter(n => !n.read && !n.archived)
    else if (tab === 'archived') list = list.filter(n => n.archived)
    else list = list.filter(n => !n.archived)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(n => n.courseCode.toLowerCase().includes(q) || n.courseTitle.toLowerCase().includes(q) || n.instructor.toLowerCase().includes(q))
    }
    return list
  }

  const filtered = getFiltered()
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
          <div className="flex gap-1">
            {([['all', 'Inbox'], ['unread', `Unread (${unreadCount})`], ['archived', 'Archived']] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelected(new Set()) }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  tab === t ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 w-48"
            />
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-xs">
            <span className="text-red-600 font-medium">{selected.size} selected</span>
            <span className="text-gray-300">|</span>
            <button onClick={markSelectedRead} className="text-gray-600 hover:text-red-600 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" /> Read</button>
            <button onClick={archiveSelected} className="text-gray-600 hover:text-red-600 flex items-center gap-1"><Archive className="w-3.5 h-3.5" /> Archive</button>
            <button onClick={deleteSelected} className="text-gray-600 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </div>
        )}

        <div className="flex items-center px-4 py-2 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider">
          <label className="flex items-center gap-2 cursor-pointer w-6">
            <input type="checkbox" checked={filtered.length > 0 && filtered.every(n => selected.has(n.id))} onChange={selectAll} className="accent-red-600 w-3.5 h-3.5" />
          </label>
          <span className="flex-1 pl-2">Course</span>
          <span className="w-24 text-center">Seats</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-20 text-right">Time</span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map(n => {
            const config = levelConfig[n.level]
            const fillPercent = (n.seatUsed / n.seatLimit) * 100
            const isChecked = selected.has(n.id)

            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-center px-4 py-3 transition-colors cursor-pointer',
                  !n.read ? 'bg-red-50/40' : 'bg-white',
                  isChecked && 'bg-red-50',
                  'hover:bg-gray-50'
                )}
              >
                <label className="flex items-center gap-2 cursor-pointer w-6" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(n.id)} className="accent-red-600 w-3.5 h-3.5" />
                </label>

                <div className="flex items-center gap-3 flex-1 pl-2 min-w-0" onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dotColor)} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-bold', !n.read ? 'text-gray-900' : 'text-gray-700')}>{n.courseCode}</span>
                      {!n.read && <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{n.courseTitle} - Sec {n.section}</p>
                    <p className="text-[10px] text-gray-400">{n.day} {n.time} / {n.instructor}</p>
                  </div>
                </div>

                <div className="w-24 flex flex-col items-center gap-1">
                  <span className="text-xs font-mono font-bold text-gray-700">{n.seatUsed}/{n.seatLimit}</span>
                  <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        fillPercent >= 100 ? 'bg-red-500' : fillPercent >= 90 ? 'bg-orange-400' : fillPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                      )}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="w-20 text-center">
                  <span className={cn('text-[10px] font-bold', config.textColor)}>
                    {n.seatLeft === 0 ? 'FULL' : `${n.seatLeft} left`}
                  </span>
                </div>

                <div className="w-20 text-right">
                  <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {n.timestamp}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {search ? 'No matching notifications' : tab === 'unread' ? 'All caught up!' : tab === 'archived' ? 'No archived notifications' : 'No notifications'}
            </p>
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
          <span>{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
          <span>Last sync: just now</span>
        </div>
      </div>
    </div>
  )
}
