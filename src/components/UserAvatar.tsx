'use client'

import { User } from '@/lib/types'

interface UserAvatarProps {
  user: User | null
  size?: 'sm' | 'md' | 'lg'
  showProviderBadge?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16'
}

const badgeSizeClasses = {
  sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  md: 'w-4 h-4 -bottom-0.5 -right-0.5',
  lg: 'w-6 h-6 -bottom-1 -right-1'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl'
}

export function UserAvatar({ user, size = 'md', showProviderBadge = true, className = '' }: UserAvatarProps) {
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getProviderIcon = () => {
    if (!user?.auth_provider || user.auth_provider === 'email') return null

    if (user.auth_provider === 'google') {
      return (
        <div className={`absolute ${badgeSizeClasses[size]} bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200`}>
          <svg className="w-2/3 h-2/3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      )
    }

    if (user.auth_provider === 'facebook') {
      return (
        <div className={`absolute ${badgeSizeClasses[size]} bg-[#1877F2] rounded-full shadow-md flex items-center justify-center`}>
          <svg className="w-2/3 h-2/3" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name || user.username || 'User avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}
      
      {/* Fallback initials avatar */}
      <div 
        className={`${sizeClasses[size]} ${user?.avatar_url ? 'hidden' : ''} rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold ${textSizeClasses[size]} border-2 border-gray-200`}
      >
        {getInitials()}
      </div>

      {/* Provider badge */}
      {showProviderBadge && getProviderIcon()}
    </div>
  )
}

export default UserAvatar
