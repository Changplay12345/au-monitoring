import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No authorization code received', requestUrl.origin))
  }

  try {
    // Create Supabase client for auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Exchange the code for a session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Auth exchange error:', authError)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(authError.message)}`, requestUrl.origin))
    }

    if (!authData.user) {
      return NextResponse.redirect(new URL('/login?error=No user data received', requestUrl.origin))
    }

    const oauthUser = authData.user
    const email = oauthUser.email
    const name = oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || email?.split('@')[0]
    const provider = oauthUser.app_metadata?.provider || 'oauth'
    const avatarUrl = oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture || null

    // Check if user exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, username, email, name, role, avatar_url, auth_provider')
      .eq('email', email)
      .single()

    let user

    if (existingUser) {
      // User exists, update avatar and provider if changed
      const { data: updatedUser } = await supabase
        .from('users')
        .update({ 
          avatar_url: avatarUrl || existingUser.avatar_url,
          auth_provider: provider,
          name: name || existingUser.name
        })
        .eq('id', existingUser.id)
        .select('id, username, email, name, role, avatar_url, auth_provider')
        .single()
      
      user = updatedUser || existingUser
    } else {
      // Create new user in our users table
      const username = email?.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6)
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: username,
          email: email,
          name: name,
          password: `oauth_${provider}_${Date.now()}`, // Placeholder password for OAuth users
          role: 'user',
          avatar_url: avatarUrl,
          auth_provider: provider
        })
        .select('id, username, email, name, role, avatar_url, auth_provider')
        .single()

      if (insertError) {
        console.error('Failed to create user:', insertError)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Failed to create account')}`, requestUrl.origin))
      }

      user = newUser
    }

    // Set auth cookie
    const cookieStore = await cookies()
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      avatar_url: user.avatar_url || null,
      auth_provider: user.auth_provider || provider
    }

    cookieStore.set('au_auth_token', encodeURIComponent(JSON.stringify(userData)), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // Redirect to home
    return NextResponse.redirect(new URL('/home', requestUrl.origin))

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=Authentication failed', requestUrl.origin))
  }
}
