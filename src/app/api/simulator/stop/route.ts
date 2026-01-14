import { NextResponse } from 'next/server'
import { stopSimulator } from '@/lib/simulatorState'

export async function POST() {
  stopSimulator()
  return NextResponse.json({ success: true })
}
