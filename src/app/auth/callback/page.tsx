'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (contains access_token for implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        // Also check for code in query params (for PKCE flow)
        const queryParams = new URLSearchParams(window.location.search)
        const code = queryParams.get('code')
        const errorParam = queryParams.get('error')
        const errorDescription = queryParams.get('error_description')

        if (errorParam) {
          setError(errorDescription || errorParam)
          return
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        let session = null

        if (accessToken) {
          // Implicit flow - set session from tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (sessionError) {
            setError(sessionError.message)
            return
          }
          session = data.session
        } else if (code) {
          // PKCE flow - exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setError(exchangeError.message)
            return
          }
          session = data.session
        } else {
          setError('No authorization token received')
          return
        }

        if (!session?.user) {
          setError('No user data received')
          return
        }

        const oauthUser = session.user
        const email = oauthUser.email
        const name = oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || email?.split('@')[0]
        const provider = oauthUser.app_metadata?.provider || 'oauth'
        const avatarUrl = oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture || null

        // Call server API to handle user creation/update (bypasses RLS with service role key)
        const response = await fetch('/api/oauth-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, provider, avatarUrl })
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          setError(result.error || 'Failed to create account')
          return
        }

        const userData = result.user

        // Store in localStorage (for useAuth hook)
        localStorage.setItem('au_monitoring_user', JSON.stringify(userData))
        
        // Set cookie (for middleware)
        document.cookie = `au_auth_token=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

        // Check if we're in a popup window
        if (window.opener) {
          // Send user data to parent window
          window.opener.postMessage({ type: 'oauth-success', user: userData }, window.location.origin)
          // Close popup after a short delay
          setTimeout(() => {
            window.close()
          }, 500)
        } else {
          // Redirect to home if not in popup
          router.push('/home')
        }

      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Authentication failed')
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/login"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20" />
          <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse" />
          <img
            src="https://upload.wikimedia.org/wikipedia/en/5/50/Assumption_University_of_Thailand_%28logo%29.png"
            alt="AU Logo"
            className="w-24 h-24 object-contain relative z-10 animate-pulse"
          />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing sign in...</h2>
        <p className="text-gray-500 text-sm">Please wait a moment</p>
      </div>
    </div>
  )
}
