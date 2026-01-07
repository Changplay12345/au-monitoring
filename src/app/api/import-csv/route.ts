import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  const supabase = createServerClient()

  try {
    // Read CSV file from public directory
    const csvPath = path.join(process.cwd(), 'public', 'data_vme_rows.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }
    
    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Parse data rows
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, idx) => {
          row[header] = values[idx] || null
        })
        data.push(row)
      }
    }
    
    console.log(`Parsed ${data.length} rows from CSV`)
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('data_vme')
      .delete()
      .neq('id', 0)
    
    if (deleteError) {
      console.error('Error clearing table:', deleteError)
    }
    
    // Insert data in batches (Supabase has a 1000 row limit per insert)
    const batchSize = 1000
    let inserted = 0
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('data_vme')
        .insert(batch)
      
      if (insertError) {
        console.error(`Error inserting batch ${i}-${i + batchSize}:`, insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      
      inserted += batch.length
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)}`)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${inserted} rows to data_vme table` 
    })
    
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
