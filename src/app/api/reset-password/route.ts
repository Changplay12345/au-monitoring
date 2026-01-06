import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find user with this reset token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Check if token has expired
    const expiry = new Date(user.reset_token_expiry)
    if (expiry < new Date()) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update password:', updateError)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
