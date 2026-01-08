import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/tqf-extractor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const session = getSession(sessionId)
    
    if (!session || !session.graph) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json(session.graph)

  } catch (error: unknown) {
    console.error('[TQF Graph API] Error:', error instanceof Error ? error.message : error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
