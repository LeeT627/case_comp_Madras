import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateEmail } from '@/lib/email-validation'

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
    const userEmail = headersList.get('x-user-email')
    
    console.log('Verification attempt - userId:', userId, 'userEmail:', userEmail)
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated - no user ID in headers' }, { status: 401 })
    }
    
    const supabase = createAdminClient()
    
    // Create or update user profile with school email
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        auth_method: 'gpai',
        school_email,
        school_email_verified: true,
        school_email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,auth_method'
      })
    
    if (upsertError) {
      console.error('Failed to update user profile:', upsertError)
      // Return more detailed error for debugging
      return NextResponse.json({ 
        error: 'Failed to verify email',
        details: upsertError.message || 'Database error'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'School email verified successfully'
    })
    
  } catch (error) {
    console.error('School email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify school email' },
      { status: 500 }
    )
  }
}