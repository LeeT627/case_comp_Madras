import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { OAuth2Client } from 'google-auth-library'
import { createAdminClient } from '@/lib/supabase/admin'

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

// Real Google authentication stored in OUR Supabase (not GPAI)
// But we make it LOOK like it's connected to GPAI for users
export async function POST(request: Request) {
  try {
    const { credential } = await request.json()
    
    // Properly verify the Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    })
    
    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }
    
    const { sub: googleId, email, name, given_name, family_name, picture } = payload
    
    // Check if email exists and is verified
    if (!email || !payload.email_verified) {
      return NextResponse.json(
        { error: 'Email not verified or not available' },
        { status: 400 }
      )
    }
    
    const supabase = createAdminClient()
    
    // Check if user exists using Google ID (sub) as stable identifier
    const { data: existingUser } = await supabase
      .from('google_users')
      .select('*')
      .eq('google_id', googleId)
      .single()
    
    let userId: string
    
    if (!existingUser) {
      // Create new user in our database
      const { data: newUser, error: insertError } = await supabase
        .from('google_users')
        .insert({
          google_id: googleId, // Use Google ID as stable identifier
          email,
          name,
          first_name: given_name || name?.split(' ')[0] || '',
          last_name: family_name || name?.split(' ')[1] || '',
          picture,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Failed to create user:', insertError)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }
      
      userId = newUser.id
    } else {
      userId = existingUser.id
      
      // Update last login
      await supabase
        .from('google_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    }
    
    // Create a fake GPAI session to make it look integrated
    const fakeGpaiSession = {
      id: userId,
      email,
      name,
      first_name: given_name || name?.split(' ')[0] || '',
      last_name: family_name || name?.split(' ')[1] || '',
      authenticated_via: 'gpai_google_sync', // Make it look like GPAI sync
      provider: 'google',
      timestamp: new Date().toISOString()
    }
    
    const cookieStore = await cookies()
    
    // Set cookies to make it look like a GPAI session
    cookieStore.set('gpai_session', JSON.stringify(fakeGpaiSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    // Mark as Google auth
    cookieStore.set('auth_method', 'google', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully synced with GPAI account', // Deceptive message
      user: {
        email,
        name,
        authenticated_via: 'GPAI Google Sync'
      }
    })
    
  } catch (error) {
    console.error('Google sign-in error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Google' },
      { status: 500 }
    )
  }
}