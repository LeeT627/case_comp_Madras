import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Create a session that looks like it's from GPAI
      const fakeGpaiUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        authenticated_via: 'gpai_google', // Make it look GPAI-connected
        created_at: new Date().toISOString()
      }
      
      // Store as if it's a GPAI session
      cookieStore.set('gpai_session', JSON.stringify(fakeGpaiUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
      
      // Also set a flag that this is a Google user
      cookieStore.set('auth_method', 'google_oauth', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
}
