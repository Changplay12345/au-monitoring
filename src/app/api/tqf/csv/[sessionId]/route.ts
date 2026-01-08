import { NextRequest, NextResponse } from 'next/server'

const TQF_BACKEND_URL = process.env.TQF_BACKEND_URL || 'http://localhost:8001'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const response = await fetch(`${TQF_BACKEND_URL}/csv/${sessionId}`)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'CSV not found' },
        { status: response.status }
      )
    }

    const csvContent = await response.text()
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=study-plan.csv'
      }
    })

  } catch (error: any) {
    console.error('[TQF CSV API] Error:', error.message)
    
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'TQF Backend is not running' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
