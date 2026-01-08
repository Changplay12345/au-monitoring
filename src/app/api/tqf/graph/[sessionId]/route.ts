import { NextRequest, NextResponse } from 'next/server'

const TQF_BACKEND_URL = process.env.TQF_BACKEND_URL || 'http://localhost:8001'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const response = await fetch(`${TQF_BACKEND_URL}/graph/${sessionId}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Graph not found' }))
      return NextResponse.json(
        { error: errorData.detail || 'Graph not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('[TQF Graph API] Error:', error.message)
    
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
