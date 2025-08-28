import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const supabase = createAdminClient()
    
    // Check if user has verified school email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('school_email, school_email_verified')
      .eq('user_id', String(userId))  // Ensure it's a string
      .eq('auth_method', 'gpai')
      .single()
    
    if (!profile) {
      // No profile yet, not verified
      return NextResponse.json({
        verified: false,
        school_email: null
      })
    }
    
    return NextResponse.json({
      verified: profile.school_email_verified || false,
      school_email: profile.school_email
    })
    
  } catch (error) {
    console.error('Error checking school email:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}