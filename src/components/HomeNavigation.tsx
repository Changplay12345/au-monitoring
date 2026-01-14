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
      image: '/project-overview.png',
      description: 'Explore our comprehensive project documentation and objectives'
    },
    { 
      icon: <Files className="w-6 h-6" />, 
      label: 'Documentation', 
      href: '/documentation',
      image: '/Documentation.png',
      description: 'Access detailed technical documentation and user guides'
    },
    { 
      icon: <Download className="w-6 h-6" />, 
      label: 'TQF Master 2.0 Desktop', 
      href: '/tqf-desktop',
      image: '/TQFDesktop.png',
      description: 'Download the desktop version of TQF Master 2.0'
    },
    { 
      icon: <Brain className="w-6 h-6" />, 
      label: 'Course Monitoring', 
      href: '/course-monitoring',
      image: 'course_monitor.png',
      description: 'Monitor and manage academic courses efficiently'
    },
    { 
      icon: <Folder className="w-6 h-6" />, 
      label: 'TQF Master 2.0', 
      href: '/tqf-master',
      image: 'Tqf first.png',
      description: 'Access the web-based TQF Master 2.0 platform'
    },
    
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
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full cursor-pointer"
              >
              {/* Image container */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with icon - no dark background */}
                <div className="absolute inset-0 flex items-start justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white shadow-md rounded-lg flex items-center justify-center group-hover:bg-red-50 transition-colors">
                      <span className="text-gray-700 group-hover:text-red-600 transition-colors">
                        {item.icon}
                      </span>
                    </div>
                    <div className="bg-white shadow-md rounded-lg px-3 py-1.5">
                      <h3 className="text-gray-800 font-semibold text-sm">{item.label}</h3>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-4 h-4 text-red-600" />
                  </div>
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
      </div>
    </div>
  )
}
