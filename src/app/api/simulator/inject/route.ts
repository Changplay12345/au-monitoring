import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TEST_TABLE = 'data_vme_test'

// Simple injection endpoint - just updates seat counts directly
export async function POST(request: Request) {
  try {
    const { registrations } = await request.json()
    
    // registrations is an array of { courseCode, section, count }
    if (!registrations || !Array.isArray(registrations)) {
      return NextResponse.json({ error: 'Invalid registrations data' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let successCount = 0
    let failedCount = 0

    for (const reg of registrations) {
      const { courseCode, section, count = 1 } = reg
      
      // Get current data
      const { data: current, error: fetchError } = await supabase
        .from(TEST_TABLE)
        .select('*')
        .eq('Course Code', courseCode)
        .eq('Section', section)
        .single()

      if (fetchError || !current) {
        failedCount += count
        continue
      }

      // Check if enough seats
      const seatsToUse = Math.min(count, current['Seat Left'])
      if (seatsToUse <= 0) {
        failedCount += count
        continue
      }

      // Update seats
      const { error: updateError } = await supabase
        .from(TEST_TABLE)
        .update({
          'Seat Used': current['Seat Used'] + seatsToUse,
          'Seat Left': current['Seat Left'] - seatsToUse,
        })
        .eq('Course Code', courseCode)
        .eq('Section', section)

      if (updateError) {
        failedCount += count
      } else {
        successCount += seatsToUse
        failedCount += (count - seatsToUse)
      }
    }

    return NextResponse.json({ 
      success: true, 
      successCount, 
      failedCount 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
