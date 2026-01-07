import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table') || 'data_vme_test'

  try {
    console.log(`[API] Fetching courses from table: ${table}`)
    
    // Use service role key to bypass RLS and schema cache issues
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })

    if (error) {
      console.error('[API] Supabase error:', error)
      
      // Check if table doesn't exist
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        return NextResponse.json({ 
          error: `Table '${table}' does not exist`,
          needsTableCreation: true,
          table: table
        }, { status: 404 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} courses from ${table}`)
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      table: table
    })

  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
