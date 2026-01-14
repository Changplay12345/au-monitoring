'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { UnderConstruction } from '@/components/UnderConstruction'

export default function AdminPanelPage() {
  return (
    <GCPLayout activeFeature="Admin Panel" projectName="Admin Panel">
      <UnderConstruction pageName="Admin Panel" />
    </GCPLayout>
  )
}
