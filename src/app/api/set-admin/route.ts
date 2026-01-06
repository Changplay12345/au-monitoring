import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// One-time API to set chen as admin
export async function GET() {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('username', 'chen')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User chen is now admin' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
