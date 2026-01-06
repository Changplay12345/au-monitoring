import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    // Get user from cookie
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('au_auth_token')
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse user from cookie
    const userData = JSON.parse(decodeURIComponent(authCookie.value))
    const userId = userData.id

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Update user in database
    const { error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
