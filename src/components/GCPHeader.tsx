'use client'

import { useState } from 'react'
import { 
  Menu, 
  Bell, 
  HelpCircle, 
  Database
} from 'lucide-react'
import { cn } from './utils'
import { ProfileDropdown } from './ProfileDropdown'
import { User } from '@/lib/types'

interface GCPHeaderProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
  projectName?: string
  onLogoClick?: () => void
  user?: User | null
  onLogout?: () => void
}

export function GCPHeader({ 
  onMenuClick, 
  isSidebarOpen, 
  projectName = 'Course Monitoring', 
  onLogoClick,
  user = null,
  onLogout = () => {}
}: GCPHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const getInitials = (name: string | null | undefined, username: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e0e0e0] z-50 flex items-center px-4 font-['Inter',_'Roboto',_sans-serif]">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Hamburger menu */}
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo - clickable to go home */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold text-red-600 tracking-tight">AU</span>
          <span className="text-xl font-light text-gray-700">USR&MP</span>
        </button>

        {/* Project selector - dynamic based on current feature */}
        <button className="flex items-center gap-2 px-3 py-1.5 border border-[#e0e0e0] rounded hover:bg-gray-50 transition-colors ml-2">
          <Database className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-medium">{projectName}</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* Help */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Help">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>

        {/* User avatar with dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-sm font-medium transition-all",
              isProfileOpen ? "ring-2 ring-red-300 ring-offset-2" : "hover:ring-2 hover:ring-red-300"
            )}
            aria-label="User menu"
          >
            {getInitials(user?.name, user?.username)}
          </button>
          
          <ProfileDropdown 
            user={user}
            onLogout={onLogout}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  )
}
