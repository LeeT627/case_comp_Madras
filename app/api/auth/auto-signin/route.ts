import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyGPAIUser } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Step 1: Verify user exists in GPAI database
    const isGPAIUser = await verifyGPAIUser(email)
    
    if (!isGPAIUser) {
      return NextResponse.json(
        { error: 'Email not found in GPAI database. Please register at www.gpai.app first.' },
        { status: 404 }
      )
    }

    // Step 2: Create Supabase client with service role for admin operations
    const supabase = await createClient()
    
    // Step 3: Check if user exists in Supabase, create if not
    let userId: string
    
    // First try to get existing user
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user without password (trusted GPAI user)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm since they're GPAI verified
        user_metadata: {
          gpai_verified: true,
          source: 'gpai_auto_signin'
        }
      })

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        )
      }
      
      userId = newUser.user.id
    }

    // Step 4: Generate session token for the user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: '/dashboard'
      }
    })

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      redirectUrl: session.properties.action_link
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}