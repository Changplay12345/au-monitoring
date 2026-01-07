import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const TEST_TABLE = 'data_vme_test'

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { courseCode, section, seatUsed, seatLeft } = body

    if (!courseCode || !section) {
      return NextResponse.json({ error: 'Missing courseCode or section' }, { status: 400 })
    }

    console.log(`[API] Updating seat for ${courseCode}-${section}: Used=${seatUsed}, Left=${seatLeft}`)

    const { data, error } = await supabase
      .from(TEST_TABLE)
      .update({
        "Seat Used": seatUsed,
        "Seat Left": seatLeft
      })
      .eq('Course Code', courseCode)
      .eq('Section', section)
      .select()
      .single()

    if (error) {
      console.error('[API] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API] Update successful:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
