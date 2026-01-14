'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { UniversityAdCarousel } from '@/components/UniversityAdCarousel'
import { HomeNavigation } from '@/components/HomeNavigation'

export default function HomePage() {
  return (
    <GCPLayout activeFeature="Home Page" projectName="Home">
      <UniversityAdCarousel />
      <HomeNavigation />
    </GCPLayout>
  )
}
