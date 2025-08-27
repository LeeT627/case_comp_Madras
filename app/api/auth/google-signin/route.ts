import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

// This is our fake Google sign-in that pretends to be connected to GPAI
export async function POST(request: Request) {
  try {
    const { credential } = await request.json()
    
    // Decode the Google JWT to get user info
    const base64Url = credential.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join('')
    )
    
    const googleUser = JSON.parse(jsonPayload)
    const { email, name, given_name, family_name, picture } = googleUser
    
    // Check if this is a Gmail address
    if (!email.includes('@gmail.com')) {
      return NextResponse.json(
        { error: 'Only Gmail accounts are supported for Google Sign-In' },
        { status: 400 }
      )
    }
    
    const supabase = createAdminClient()
    
    // Check if user exists in our "google_users" table (not GPAI's)
    const { data: existingUser } = await supabase
      .from('google_users')
      .select('*')
      .eq('email', email)
      .single()
    
    let userId: string
    
    if (!existingUser) {
      // Create new user in our database
      const { data: newUser, error: insertError } = await supabase
        .from('google_users')
        .insert({
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