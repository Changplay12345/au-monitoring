import { NextRequest, NextResponse } from 'next/server'
import { fastExtractStudyPlan } from '@/lib/tqf-extractor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use TypeScript extractor directly (no Python backend needed)
    const result = await fastExtractStudyPlan(buffer, file.name)
    
    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error('[TQF API] Error:', error instanceof Error ? error.message : error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
