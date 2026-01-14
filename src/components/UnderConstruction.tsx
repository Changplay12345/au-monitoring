'use client'

import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  pageName: string
}

export function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
          <Construction className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{pageName}</h1>
        <p className="text-lg text-gray-500 mb-2">Under Construction</p>
        <p className="text-sm text-gray-400">This page is currently being developed. Check back soon!</p>
      </div>
    </div>
  )
}
