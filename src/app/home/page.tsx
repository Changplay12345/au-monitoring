'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { UnderConstruction } from '@/components/UnderConstruction'

export default function HomePage() {
  return (
    <GCPLayout activeFeature="Home Page" projectName="Home">
      <UnderConstruction pageName="Home Page" />
    </GCPLayout>
  )
}
