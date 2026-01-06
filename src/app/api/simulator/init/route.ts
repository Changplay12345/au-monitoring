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

    // Delete existing data in test table
    const { error: deleteError } = await supabase
      .from(TEST_TABLE)
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('Error clearing test table:', deleteError)
      // Continue anyway - table might be empty
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
