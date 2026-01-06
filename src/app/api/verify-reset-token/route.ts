import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' })
    }

    // Find user with this reset token
    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (error || !user) {
      return NextResponse.json({ valid: false, error: 'Invalid token' })
    }

    // Check if token has expired
    const expiry = new Date(user.reset_token_expiry)
    if (expiry < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token has expired' })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' })
  }
}
