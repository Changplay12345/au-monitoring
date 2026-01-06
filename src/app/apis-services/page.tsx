'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { RoleGuard } from '@/components/RoleGuard'
import { UnderConstruction } from '@/components/UnderConstruction'

export default function APIsServicesPage() {
  return (
    <RoleGuard requiredRole="admin">
      <GCPLayout activeFeature="APIs & Services" projectName="APIs & Services">
        <UnderConstruction pageName="APIs & Services" />
      </GCPLayout>
    </RoleGuard>
  )
}
