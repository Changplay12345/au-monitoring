'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { UnderConstruction } from '@/components/UnderConstruction'

export default function ProjectOverviewPage() {
  return (
    <GCPLayout activeFeature="Project Overview" projectName="Project Overview">
      <UnderConstruction pageName="Project Overview" />
    </GCPLayout>
  )
}
