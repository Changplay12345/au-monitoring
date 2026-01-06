import { NextResponse } from 'next/server'
import { resetSimulator } from '@/lib/simulatorState'

export async function POST() {
  const success = await resetSimulator()
  return NextResponse.json({ success })
}
