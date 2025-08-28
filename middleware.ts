import { NextRequest, NextResponse } from 'next/server'

const GPAI_API_URL = 'https://api-prod.gpai.app'

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/how-to-apply') || pathname === '/') {
    return NextResponse.next()
  }

  // Check authentication with GPAI backend
  try {
    // Get sessionId cookie
    const sessionId = request.cookies.get('sessionId')?.value
    
    if (!sessionId) {
      // No session cookie, redirect to sign-in
      const url = new URL('/sign-in', request.url)
      return NextResponse.redirect(url)
    }
    
    // Verify session with GPAI API
    const res = await fetch(`${GPAI_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `sessionId=${sessionId}`,
      },
    })
    
    if (res.ok) {
      // User is authenticated
      const userData = await res.json()
      
      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', userData.id)
      requestHeaders.set('x-user-email', userData.email)
      
      // If accessing dashboard, check if school email is verified
      if (pathname.startsWith('/dashboard')) {
        // Make a request to our API to check school email verification
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('school_email_verified')
          .eq('user_id', userData.id)
          .eq('auth_method', 'gpai')
          .single()
        
        if (!profile || !profile.school_email_verified) {
          // Redirect to school email verification
          const url = new URL('/verify-school-email', request.url)
          return NextResponse.redirect(url)
        }
      }
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  } catch (error) {
    console.error('[Middleware] Auth check failed:', error)
  }
  
  // Not authenticated, redirect to sign-in
  const url = new URL('/sign-in', request.url)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/verify-school-email',
    '/api/participant-info',
    '/api/uploads/:path*',
    '/api/auth/check-school-email',
    '/api/auth/verify-school-email',
  ],
}
