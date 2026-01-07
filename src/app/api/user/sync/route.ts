import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// API to sync user data from database (for real-time role updates)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, avatar_url, auth_provider, has_password')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name,
        role: data.role || 'user',
        avatar_url: data.avatar_url,
        auth_provider: data.auth_provider,
        has_password: data.has_password === true
      }
    })
  } catch (error: any) {
    console.error('User sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
