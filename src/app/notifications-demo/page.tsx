'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NotificationsDemoIndex() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/notifications-demo/demo1')
  }, [router])
  return null
}
