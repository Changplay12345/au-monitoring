import { NextRequest, NextResponse } from 'next/server'

// In-memory store for page visibility (for real-time updates)
let hiddenPages: Set<string> = new Set()
let fullyHiddenPages: Set<string> = new Set()
let lastUpdateTimestamp = Date.now()

// GET - Get all hidden pages
export async function GET() {
  return NextResponse.json({
    success: true,
    hiddenPages: Array.from(hiddenPages),
    fullyHiddenPages: Array.from(fullyHiddenPages),
    timestamp: lastUpdateTimestamp
  })
}

// POST - Update page visibility
export async function POST(request: NextRequest) {
  try {
    const { pageId, isHidden, isFullyHidden } = await request.json()

    if (!pageId) {
      return NextResponse.json({ success: false, error: 'Page ID required' }, { status: 400 })
    }

    // Handle fully hidden (hides from everyone including admin)
    if (isFullyHidden !== undefined) {
      if (isFullyHidden) {
        fullyHiddenPages.add(pageId)
        hiddenPages.delete(pageId) // Remove from regular hidden if fully hidden
      } else {
        fullyHiddenPages.delete(pageId)
      }
    }
    // Handle regular hidden (hides from users only)
    else if (isHidden !== undefined) {
      if (isHidden) {
        hiddenPages.add(pageId)
        fullyHiddenPages.delete(pageId) // Remove from fully hidden if regular hidden
      } else {
        hiddenPages.delete(pageId)
      }
    }
    
    lastUpdateTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      pageId,
      isHidden: hiddenPages.has(pageId),
      isFullyHidden: fullyHiddenPages.has(pageId),
      hiddenPages: Array.from(hiddenPages),
      fullyHiddenPages: Array.from(fullyHiddenPages),
      timestamp: lastUpdateTimestamp
    })
  } catch (error) {
    console.error('Error updating page visibility:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
