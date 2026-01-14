import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('email', email)
      .single()

    if (findError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to store reset token:', updateError)
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://au-monitoring.site'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Send email using Resend or other email service
    // For now, we'll log it and simulate success
    console.log('Password reset requested for:', email)
    console.log('Reset URL:', resetUrl)

    // If you have Resend API key, uncomment this:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'AU Monitoring <noreply@au-monitoring.site>',
      to: email,
      subject: 'Reset Your Password - AU-Monitoring',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Reset Your Password</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password for your AU-Monitoring account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #666; font-size: 12px;">AU-Monitoring - Assumption University Student Registration & Monitoring Platform</p>
        </div>
      `
    })
    */

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a reset link has been sent.',
      // For development, include the reset URL
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
