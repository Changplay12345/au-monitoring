import { NextResponse } from 'next/server'
import { getSimulatorState } from '@/lib/simulatorState'

export async function GET() {
  const state = getSimulatorState()
  return NextResponse.json(state)
}
