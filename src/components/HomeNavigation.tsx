'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { 
  Home,
  Laptop,
  Files,
  Download,
  Brain,
  Folder,
  Code2,
  Users,
  ArrowRight
} from 'lucide-react'

interface NavigationItem {
  icon: React.ReactNode
  label: string
  href: string
  image: string
  description: string
}

export function HomeNavigation() {
  const router = useRouter()
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Navigation items with images
  const navigationItems: NavigationItem[] = [
    { 
      icon: <Laptop className="w-6 h-6" />, 
      label: 'Project Overview', 
      href: '/project-overview',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      description: 'Explore our comprehensive project documentation and objectives'
    },
    { 
      icon: <Files className="w-6 h-6" />, 
      label: 'Documentation', 
      href: '/documentation',
      image: 'Documentation.png',
      description: 'Access detailed technical documentation and user guides'
    },
    { 
      icon: <Download className="w-6 h-6" />, 
      label: 'TQF Master 2.0 Desktop', 
      href: '/tqf-desktop',
      image: 'TQFDesktop.png',
      description: 'Download the desktop version of TQF Master 2.0'
    },
    { 
      icon: <Brain className="w-6 h-6" />, 
      label: 'Course Monitoring', 
      href: '/',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      description: 'Monitor and manage academic courses efficiently'
    },
    { 
      icon: <Folder className="w-6 h-6" />, 
      label: 'TQF Master 2.0', 
      href: 'http://localhost:3000',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      description: 'Access the web-based TQF Master 2.0 platform'
    },
    { 
      icon: <Code2 className="w-6 h-6" />, 
      label: 'APIs & Services', 
      href: '/apis-services',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
      description: 'Explore our APIs and integration services'
    }
  ]

  // Intersection observer for fade-in animations
  useEffect(() => {
    // Start with all cards visible after a short delay
    const timeoutId = setTimeout(() => {
      const allCardIndices = navigationItems.map((_, index) => index)
      setVisibleCards(new Set([...allCardIndices, navigationItems.length])) // Include admin panel
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleNavigation = (href: string) => {
    if (href.startsWith('http')) {
      // External link - open in new tab
      window.open(href, '_blank')
    } else {
      // Internal navigation
      router.push(href)
    }
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Explore Our Platform</h2>
          <p className="text-lg text-gray-600">Click on any card to navigate to the corresponding page</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigationItems.map((item, index) => (
            <div
              key={item.label}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              data-card-id={item.label}
              className={`transition-all duration-700 ease-out ${
                visibleCards.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full"
              >
              {/* Image container */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-start justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <span className="text-gray-800 group-hover:text-red-600 transition-colors">
                        {item.icon}
                      </span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <h3 className="text-white font-semibold text-lg">{item.label}</h3>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 text-left bg-white/95 backdrop-blur-sm">
                <p className="text-gray-700 text-sm mb-4 font-medium">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium text-sm group-hover:text-red-700 transition-colors">
                    Explore →
                  </span>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>
              
              {/* Hover effect border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500 rounded-xl transition-colors duration-300 pointer-events-none" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Admin Panel - Special card */}
        <div className="mt-8">
          <div 
            ref={(el) => {
              cardRefs.current[navigationItems.length] = el
            }}
            data-card-id="admin-panel"
            className={`transition-all duration-700 ease-out delay-200 ${
              visibleCards.has(navigationItems.length)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
            <button
              onClick={() => handleNavigation('/admin-panel')}
              className="w-full group relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
            <div className="relative p-8 flex items-center justify-between">
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">Admin Panel</h3>
                  <p className="text-white/80 text-sm">Access administrative controls and settings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">Admin Access</span>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}
