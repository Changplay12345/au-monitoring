import { NextRequest, NextResponse } from 'next/server'

const TQF_BACKEND_URL = process.env.TQF_BACKEND_URL || 'http://localhost:8001'

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

    // Forward request to Python backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const response = await fetch(`${TQF_BACKEND_URL}/parse-fast`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Backend error' }))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to parse document' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('[TQF API] Error:', error.message)
    
    // Check if it's a connection error (backend not running)
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return NextResponse.json(
        { 
          error: 'TQF Backend is not running. Please start the backend server first.',
          hint: 'Run: cd backend-tqf && python main.py'
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
