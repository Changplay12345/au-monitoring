'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UniversityAd {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

const universityAds: UniversityAd[] = [
  {
    id: 1,
    title: "AU-Monitoring",
    subtitle: "Web Platform",
    description: "A comprehensive web-based platform providing real-time course monitoring, analytics, and management capabilities.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop",
    ctaText: "Try Now",
    ctaLink: "/course-monitoring"
  },
  {
    id: 2,
    title: "TQF Master 2.0",
    subtitle: "Desktop Application",
    description: "Intelligent software solution designed to streamline academic planning and curriculum management.",
    image: "/tqf showcase.png",
    ctaText: "Try Now",
    ctaLink: "/tqf-master"
  },
  {
    id: 3,
    title: "Hardware System",
    subtitle: "Physical Infrastructure",
    description: "Robust hardware components forming the foundation of our monitoring ecosystem for data collection.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop",
    ctaText: "",
    ctaLink: ""
  }
]

export function UniversityAdCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlayKey, setAutoPlayKey] = useState(0)

  const nextSlide = (manual = false) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % universityAds.length)
    if (manual) setAutoPlayKey(prev => prev + 1)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + universityAds.length) % universityAds.length)
    setAutoPlayKey(prev => prev + 1)
  }

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
    setAutoPlayKey(prev => prev + 1)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide(false)
    }, 5000)

    return () => clearInterval(timer)
  }, [autoPlayKey])

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {universityAds.map((ad) => (
          <div key={ad.id} className="min-w-full h-full relative">
            <img 
              src={ad.image} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-8">
                <p className="text-sm font-medium mb-2 bg-red-600 inline-block px-3 py-1 rounded-full">
                  {ad.subtitle}
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {ad.title}
                </h2>
                <p className="text-lg mb-6 max-w-2xl mx-auto">
                  {ad.description}
                </p>
                {ad.ctaText && ad.ctaLink && (
                  <a 
                    href={ad.ctaLink}
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {ad.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => nextSlide(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {universityAds.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex 
                ? 'bg-red-500 w-6' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
