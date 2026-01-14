import { NextRequest, NextResponse } from 'next/server'
import { getCSV } from '@/lib/tqf-extractor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const csvContent = getCSV(sessionId)
    
    if (!csvContent) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=study-plan.csv'
      }
    })

  } catch (error: unknown) {
    console.error('[TQF CSV API] Error:', error instanceof Error ? error.message : error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
