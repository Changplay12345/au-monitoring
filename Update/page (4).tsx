'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { ProjectOverview } from '@/components/ProjectOverview'

export default function ProjectOverviewPage() {
  return (
    <GCPLayout activeFeature="Project Overview" projectName="Project Overview">
      <ProjectOverview />
    </GCPLayout>
  )
}
