import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, name, provider, avatarUrl } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username, email, name, role, avatar_url, auth_provider, has_password, password')
      .eq('email', email)
      .single()

    let user
    let hasPassword = false

    if (existingUser) {
      // User exists - merge account
      const existingPassword = existingUser.password || ''
      hasPassword = existingUser.has_password || (existingPassword.startsWith('$2') && !existingPassword.startsWith('oauth_'))
      
      // Update with OAuth info but preserve existing data
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: avatarUrl || existingUser.avatar_url,
          auth_provider: provider,
          name: name || existingUser.name
        })
        .eq('id', existingUser.id)
        .select('id, username, email, name, role, avatar_url, auth_provider, has_password')
        .single()
      
      if (updateError) {
        console.error('Update error:', updateError)
      }
      
      user = updatedUser || existingUser
      if (user) user.has_password = hasPassword
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: email,
          email: email,
          name: name,
          password: `oauth_${provider}_${Date.now()}`,
          role: 'user',
          avatar_url: avatarUrl,
          auth_provider: provider,
          has_password: false
        })
        .select('id, username, email, name, role, avatar_url, auth_provider, has_password')
        .single()

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create account: ' + insertError.message }, { status: 500 })
      }

      user = newUser
      hasPassword = false
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      avatar_url: user.avatar_url || null,
      auth_provider: provider,
      has_password: hasPassword
    }

    return NextResponse.json({ success: true, user: userData })

  } catch (error) {
    console.error('OAuth user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
