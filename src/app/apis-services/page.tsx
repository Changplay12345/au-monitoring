'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { UnderConstruction } from '@/components/UnderConstruction'

export default function APIsServicesPage() {
  return (
    <GCPLayout activeFeature="APIs & Services" projectName="APIs & Services">
      <UnderConstruction pageName="APIs & Services" />
    </GCPLayout>
  )
}
