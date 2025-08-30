import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateEmail } from '@/lib/email-validation'
import { isEmailWhitelisted } from '@/lib/whitelist-emails'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { school_email } = await request.json()
    
    if (!school_email) {
      return NextResponse.json({ error: 'School email is required' }, { status: 400 })
    }
    
    // Validate the email
    const validation = validateEmail(school_email)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    
    console.log('Sending verification email - userId:', userId, 'to:', school_email)
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated - no user ID in headers' }, { status: 401 })
    }
    
    const supabase = createAdminClient()
    
    // Check if email is whitelisted - if so, auto-verify without sending email
    if (isEmailWhitelisted(school_email)) {
      console.log('[WHITELIST] Auto-verifying whitelisted email:', school_email)
      
      // Directly update/create user profile as verified
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: String(userId),
          auth_method: 'gpai',
          school_email,
          school_email_verified: true,
          school_email_verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,auth_method'
        })
      
      if (profileError) {
        console.error('Failed to auto-verify whitelisted email:', profileError)
        return NextResponse.json({ 
          error: 'Failed to verify whitelisted email',
          details: profileError.message
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Email automatically verified (whitelisted)',
        whitelisted: true
      })
    }
    
    // Generate verification code for non-whitelisted emails
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    
    // Store verification code in database
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        user_id: String(userId),
        email: school_email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })
    
    if (insertError) {
      console.error('Failed to store verification code:', insertError)
      return NextResponse.json({ 
        error: 'Failed to generate verification code',
        details: insertError.message
      }, { status: 500 })
    }
    
    // BYPASS FOR LOCAL TESTING - Show code in console
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) {
      console.log('================================================')
      console.log('[DEV MODE] Verification code for', school_email)
      console.log('CODE:', code)
      console.log('Or use bypass code: 999999')
      console.log('================================================')
    }
    
    // Send verification email using Resend
    try {
      const { data, error: emailError } = await resend.emails.send({
        from: 'GPAI Case Competition <no-reply@mail.gpai.app>',
        to: school_email,
        subject: 'Verify Your School Email - GPAI Case Competition',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #1f2937; margin-bottom: 20px;">GPAI Case Competition</h1>
                <h2 style="color: #4b5563; margin-bottom: 20px;">Verify Your School Email</h2>
                
                <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for registering for the GPAI Case Competition at IIT Delhi BNC. 
                  Please use the verification code below to confirm your school email address:
                </p>
                
                <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                  <p style="color: #1e40af; font-size: 14px; margin-bottom: 10px;">Your verification code:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; margin: 0;">${code}</p>
                </div>
                
                <p style="color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
                  This code will expire in 15 minutes. If you didn't request this verification, 
                  please ignore this email.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    Prize Pool: ₹120,000<br>
                    Location: IIT Delhi BNC
                  </p>
                </div>
                
                <div style="margin-top: 20px;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    For help, please email: global@teamturing.com
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
      
      if (emailError) {
        console.error('Failed to send email:', emailError)
        return NextResponse.json({ 
          error: 'Failed to send verification email',
          details: 'Email service error'
        }, { status: 500 })
      }
      
      console.log('Verification email sent successfully:', data)
    } catch (emailErr) {
      console.error('Resend error:', emailErr)
      return NextResponse.json({ 
        error: 'Failed to send verification email',
        details: 'Please check if RESEND_API_KEY is configured'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully'
    })
    
  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}