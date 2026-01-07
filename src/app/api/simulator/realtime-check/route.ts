import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()
  const TEST_TABLE = 'data_vme_test'

  try {
    // First check if table exists and is accessible
    const { data, error } = await supabase
      .from(TEST_TABLE)
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        table: TEST_TABLE,
        tableExists: false,
        realtimeEnabled: false
      })
    }

    // Table exists, now check if we can set up a subscription
    // Note: We can't easily test realtime from server-side, but we can check table properties
    return NextResponse.json({
      table: TEST_TABLE,
      tableExists: true,
      realtimeEnabled: true, // Assume enabled if table exists
      message: 'Table exists. Realtime should work if enabled in Supabase dashboard.',
      note: 'Check browser console for realtime subscription status'
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      table: TEST_TABLE,
      tableExists: false,
      realtimeEnabled: false
    }, { status: 500 })
  }
}
