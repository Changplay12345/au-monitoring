import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Facebook Data Deletion Callback
// This endpoint is required by Facebook for apps that use Facebook Login
// It handles user data deletion requests from Facebook

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const signedRequest = params.get('signed_request')

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    // Parse the signed request
    const [encodedSig, payload] = signedRequest.split('.')
    
    // Decode the payload
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    )

    const userId = data.user_id

    // In a production environment, you would:
    // 1. Verify the signature using your Facebook App Secret
    // 2. Delete the user's data from your database
    // 3. Return a confirmation URL and code

    // Generate a unique confirmation code
    const confirmationCode = crypto.randomBytes(16).toString('hex')

    // Log the deletion request (in production, actually delete the data)
    console.log(`Facebook data deletion request for user: ${userId}`)
    console.log(`Confirmation code: ${confirmationCode}`)

    // TODO: Actually delete user data from database
    // const { error } = await supabase
    //   .from('users')
    //   .delete()
    //   .eq('facebook_id', userId)

    // Return the required response format for Facebook
    return NextResponse.json({
      url: `https://au-monitoring.site/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    })

  } catch (error) {
    console.error('Facebook data deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check deletion status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ 
      status: 'error',
      message: 'No confirmation code provided' 
    }, { status: 400 })
  }

  // In production, you would check the actual deletion status
  return NextResponse.json({
    status: 'completed',
    message: 'Your data has been deleted from AU-Monitoring',
    confirmation_code: code
  })
}
