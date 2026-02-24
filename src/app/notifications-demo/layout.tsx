'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bell, ArrowLeft } from 'lucide-react'

const demos = [
  { href: '/notifications-demo/demo1', label: 'Demo 1 - Card Stack' },
  { href: '/notifications-demo/demo2', label: 'Demo 2 - Timeline Feed' },
  { href: '/notifications-demo/demo3', label: 'Demo 3 - Dashboard Grid' },
  { href: '/notifications-demo/demo4', label: 'Demo 4 - Grouped Table' },
  { href: '/notifications-demo/demo5', label: 'Demo 5 - Minimal List' },
]

export default function NotificationsDemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/home" className="text-gray-500 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Bell className="w-5 h-5 text-red-600" />
          <h1 className="text-lg font-bold text-gray-800">Course Notification Demos</h1>
          <span className="text-xs text-gray-400 ml-1">Pick your favorite</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {demos.map(d => (
            <Link
              key={d.href}
              href={d.href}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                pathname === d.href
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              )}
            >
              {d.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}
