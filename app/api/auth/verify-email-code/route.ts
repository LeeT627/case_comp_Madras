import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { code, school_email } = await request.json()
    
    if (!code || !school_email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 })
    }
    
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const supabase = createAdminClient()
    
    // BYPASS FOR LOCAL TESTING ONLY
    const BYPASS_CODE = '999999'
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv && code === BYPASS_CODE) {
      console.log('[DEV MODE] Using bypass code for verification')
      // Skip verification and proceed directly
    } else {
      // Normal verification flow
      // Check if code is valid and not expired
      const { data: verificationData, error: fetchError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('user_id', String(userId))
        .eq('email', school_email)
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single()
      
      if (fetchError || !verificationData) {
        console.error('Invalid or expired code:', fetchError)
        return NextResponse.json({ 
          error: 'Invalid or expired verification code' 
        }, { status: 400 })
      }
      
      // Mark code as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id)
      
      if (updateError) {
        console.error('Failed to mark code as used:', updateError)
      }
    }
    
    // Update user profile with verified email
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
      .select()
    
    if (profileError) {
      console.error('Failed to update user profile:', profileError)
      return NextResponse.json({ 
        error: 'Failed to verify email',
        details: profileError.message
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully'
    })
    
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}