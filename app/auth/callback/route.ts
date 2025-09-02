import { NextRequest, NextResponse } from 'next/server'

const GPAI_API_URL = 'https://api-prod.gpai.app'

export async function GET(request: NextRequest) {
  try {
    // Log all parameters to see what GPAI actually sends
    const searchParams = request.nextUrl.searchParams
    const allParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      allParams[key] = value
    })
    console.log('[AUTH CALLBACK] Received parameters:', allParams)
    console.log('[AUTH CALLBACK] Full URL:', request.url)
    
    // Try different possible parameter names
    const sessionId = searchParams.get('sessionId') || 
                     searchParams.get('token') || 
                     searchParams.get('auth_token') ||
                     searchParams.get('access_token') ||
                     searchParams.get('code')

    if (!sessionId) {
      // No session ID provided, redirect to sign-in with an error
      const signInUrl = new URL('/sign-in', request.nextUrl.origin)
      signInUrl.searchParams.set('error', `Authentication failed. No session ID provided. Params received: ${JSON.stringify(allParams)}`)
      return NextResponse.redirect(signInUrl)
    }

    // Check with GPAI API if the session ID is valid
    const res = await fetch(`${GPAI_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sessionId=${sessionId}`,
      },
    })

    if (res.ok) {
      // The session ID is valid. GPAI returned user data.
      // Now, set the session cookie for our domain.
      const response = NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
      
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    } else {
      // The session ID was invalid. Redirect to sign-in with an error.
      const signInUrl = new URL('/sign-in', request.nextUrl.origin)
      signInUrl.searchParams.set('error', 'Authentication failed. Invalid session ID.')
      return NextResponse.redirect(signInUrl)
    }
  } catch (error) {
    console.error('Error in GPAI auth callback:', error)
    // General error, redirect to sign-in with an error.
    const signInUrl = new URL('/sign-in', request.nextUrl.origin)
    signInUrl.searchParams.set('error', 'An unexpected error occurred during authentication.')
    return NextResponse.redirect(signInUrl)
  }
}