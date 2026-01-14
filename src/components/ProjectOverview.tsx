'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Globe, Code, HardDrive, Laptop } from 'lucide-react'

interface ProjectSection {
  id: number
  title: string
  subtitle: string
  description: string
  images: string[]
  icon: React.ReactNode
  features: string[]
}

interface ProjectCarouselProps {
  images: string[]
  title: string
  autoSlideInterval?: number
}

function ProjectCarousel({ images, title, autoSlideInterval = 4000 }: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlayKey, setAutoPlayKey] = useState(0)

  const nextSlide = (manual = false) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    if (manual) setAutoPlayKey(prev => prev + 1) // Reset auto-timer
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    setAutoPlayKey(prev => prev + 1) // Reset auto-timer
  }

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
    setAutoPlayKey(prev => prev + 1) // Reset auto-timer
  }

  // Auto-play functionality - resets when autoPlayKey changes
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide(false)
    }, autoSlideInterval)

    return () => clearInterval(timer)
  }, [autoPlayKey, autoSlideInterval])

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-xl shadow-lg border border-gray-200">
      {/* Slides container */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img 
              src={image} 
              alt={`${title} - Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => nextSlide(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function ProjectOverview() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set())
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const projectSections: ProjectSection[] = [{
      id: 1,
      title: "Web App Monitoring Platform",
      subtitle: "Real-time Analytics Dashboard",
      description: "A comprehensive web-based platform providing real-time monitoring, analytics, and management capabilities for educational institutions.",
      images: [
        "/WebOverview1.png",
        "/course_monitor.png",
        "/WebOverview3.png"
      ],
      icon: <Globe className="w-8 h-8" />,
      features: [
        "Real-time data visualization",
        "Customizable dashboard widgets",
        "Automated reporting system",
        "Multi-user collaboration tools"
      ]
    },
    {
      id: 2,
      title: "Software Application TQF Master",
      subtitle: "Study Plan Maker",
      description: "TQF Master is a comprehensive software solution designed to streamline academic planning and curriculum management through intelligent automation.",
      images: [
        "/tqf first.png",
        "/tqf studyplan.png",
        "/tqfcustomize.png"
      ],
      icon: <Code className="w-8 h-8" />,
      features: [
        "Automated study plan generation",
        "Curriculum alignment with TQF standards",
        "Progress tracking and analytics",
        "Export capabilities for multiple formats"
      ]
    },
    {
      id: 3,
      title: "Hardware",
      subtitle: "Physical Infrastructure",
      description: "Our hardware components form the foundation of the monitoring ecosystem, providing robust and reliable infrastructure for data collection and processing.",
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop"
      ],
      icon: <HardDrive className="w-8 h-8" />,
      features: [
        "High-performance servers for data processing",
        "IoT sensors for real-time monitoring",
        "Network infrastructure for seamless connectivity",
        "Storage solutions for large-scale data management"
      ]
    }
  ]

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = parseInt(entry.target.getAttribute('data-section-id') || '0')
            setVisibleSections((prev) => new Set(prev).add(sectionId))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <Laptop className="w-8 h-8" />
              </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Project Overview</h1>
          <p className="text-xl md:text-2xl text-white opacity-80 max-w-3xl mx-auto">
            A comprehensive ecosystem combining hardware, software, and web platforms to revolutionize educational monitoring and management
          </p>
        </div>
      </div>

      {/* Project Sections */}
      <div className="container mx-auto px-6 lg:px-24 py-12">
        {projectSections.map((section, index) => (
          <div 
            key={section.id} 
            ref={(el) => {
              sectionRefs.current[index] = el
            }}
            data-section-id={section.id}
            className={`mb-16 transition-all duration-700 ease-out ${
              index !== projectSections.length - 1 ? 'border-b border-gray-200 pb-16' : ''
            } ${
              visibleSections.has(section.id)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content Section */}
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''} transition-all duration-400 delay-200 ${
                visibleSections.has(section.id)
                  ? 'opacity-100 translate-x-0'
                  : index % 2 === 1 ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-red-600">{section.title}</h2>
                    <p className="text-lg text-gray-600">{section.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  {section.description}
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features:</h3>
                  <ul className="space-y-3">
                    {section.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-red-600 rounded-full" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Carousel Section */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} transition-all duration-400 delay-300 ${
                visibleSections.has(section.id)
                  ? 'opacity-100 translate-x-0'
                  : index % 2 === 1 ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'
              }`}>
                <ProjectCarousel 
                  images={section.images} 
                  title={section.title}
                  autoSlideInterval={4000}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Integrated Solution</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our three-component system works seamlessly together to provide a comprehensive educational monitoring and management solution.
          </p>
        </div>
      </div>
    </div>
  )
}
