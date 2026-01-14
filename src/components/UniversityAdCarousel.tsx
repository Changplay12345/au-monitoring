'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UniversityAd {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  backgroundColor: string
}

const universityAds: UniversityAd[] = [
  {
    id: 1,
    title: "Welcome to",
    subtitle: "Assumption University",
    description: "Discover excellence in education and innovation at Thailand's premier international university",
    image: "https://static.wixstatic.com/media/1145f8_ffd944bb4e3842afa196f617c8798634~mv2.jpg/v1/fit/w_2500,h_1330,al_c/1145f8_ffd944bb4e3842afa196f617c8798634~mv2.jpg",
    backgroundColor: "bg-black"
  },
  {
    id: 2,
    title: "Join Our",
    subtitle: "Global Community",
    description: "Experience world-class education with students from over 80 countries",
    image: "https://admissions.au.edu/wp-content/uploads/2019/09/School-of-Biotechnology-%E2%80%93-Agro-Industry_1122x458.jpg",
    backgroundColor: "bg-black"
  },
  {
    id: 3,
    title: "Innovation &",
    subtitle: "Technology",
    description: "Lead the future with cutting-edge programs and state-of-the-art facilities",
    image: "https://admissions.au.edu/wp-content/uploads/2020/05/16-scaled.jpg",
    backgroundColor: "bg-black"
  }
]

export function UniversityAdCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % universityAds.length)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + universityAds.length) % universityAds.length)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 3000) // Change slide every 1 second

    return () => clearInterval(timer)
  }, []) // Empty dependency array - timer runs continuously

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides container */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {universityAds.map((ad, index) => (
          <div key={ad.id} className="min-w-full h-full relative">
            {/* Background image */}
            <img 
              src={ad.image} 
              alt={`${ad.title} ${ad.subtitle}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Color overlay with opacity */}
            <div className={`absolute inset-0 ${ad.backgroundColor} opacity-30`} />
            
            {/* Content container */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Left side - Clear image area */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-[400px] h-[400px]">
                    {/* This space is intentionally left empty since image is now background */}
                  </div>
                </div>

                {/* Right side - Text content */}
                <div className="flex-1 text-white text-right">
                  <h1 className="text-6xl font-bold mb-2 leading-tight">
                    {ad.title}
                  </h1>
                  <h2 className="text-5xl font-bold mb-6 leading-tight">
                    {ad.subtitle}
                  </h2>
                  <p className="text-xl mb-8 max-w-2xl ml-auto">
                    {ad.description}
                  </p>
                  
                  {/* Service icons */}
                  <div className="flex justify-end space-x-8 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-sm">Programs</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-sm">Campus</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-sm">Community</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <p className="text-sm">Global</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {universityAds.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
