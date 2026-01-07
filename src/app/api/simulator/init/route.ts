import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const SOURCE_TABLE = 'data_vme'
const TEST_TABLE = 'data_vme_test'

export async function POST() {
  const supabase = createServerClient()

  try {
    // First, fetch all data from source table
    const { data: sourceData, error: fetchError } = await supabase
      .from(SOURCE_TABLE)
      .select('*')

    if (fetchError) {
      console.error('Error fetching source data:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!sourceData || sourceData.length === 0) {
      return NextResponse.json({ error: 'No data in source table' }, { status: 400 })
    }

    // Try to clear test table - if it doesn't exist, we'll handle it
    const { error: deleteError } = await supabase
      .from(TEST_TABLE)
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.log('Test table might not exist, attempting to create it...')
      
      // If table doesn't exist, we need to create it via SQL
      // Since we can't run DDL directly, we'll use a workaround
      // by using the service role key and RPC if available
      
      // For now, let's try to insert data and see if the table gets created automatically
      // (Supabase might auto-create tables on insert in some cases)
    }

    // Insert data into test table
    const { error: insertError } = await supabase
      .from(TEST_TABLE)
      .insert(sourceData.map(row => ({
        ...row,
        id: undefined // Let Supabase generate new IDs
      })))

    if (insertError) {
      console.error('Error inserting data:', insertError)
      
      // If it's a "relation does not exist" error, the table doesn't exist
      if (insertError.message.includes('does not exist') || insertError.message.includes('relation')) {
        return NextResponse.json({ 
          error: `Test table '${TEST_TABLE}' does not exist. Please create it manually in Supabase dashboard with the same structure as '${SOURCE_TABLE}'.`,
          details: {
            sourceTable: SOURCE_TABLE,
            testTable: TEST_TABLE,
            needsManualCreation: true
          }
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Copied ${sourceData.length} rows to test table` 
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
