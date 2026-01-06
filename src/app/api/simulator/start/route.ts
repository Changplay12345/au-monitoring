import { NextResponse } from 'next/server'
import { startSimulator } from '@/lib/simulatorState'

export async function POST(request: Request) {
  try {
    const config = await request.json()
    const sessionId = await startSimulator(config)
    return NextResponse.json({ success: true, sessionId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
