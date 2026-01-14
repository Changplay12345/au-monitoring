import { NextResponse } from 'next/server'
import { killSimulator } from '@/lib/simulatorState'

export async function POST() {
  try {
    killSimulator()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
