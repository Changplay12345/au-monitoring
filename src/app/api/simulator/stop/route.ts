import { NextResponse } from 'next/server'
import { stopSimulator } from '@/lib/simulatorState'

export async function POST() {
  await stopSimulator()
  return NextResponse.json({ success: true })
}
