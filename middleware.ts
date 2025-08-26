import { NextRequest, NextResponse } from 'next/server'
import { GPAI_API_BASE } from './lib/gpaiClient'

export async function middleware(request: NextRequest) {
  // Protect dashboard routes using gpai session
  try {
    const cookie = request.headers.get('cookie') ?? ''
    console.log('[Middleware] Cookie:', cookie)
    console.log('[Middleware] Checking auth at:', `${GPAI_API_BASE}/api/auth/me`)
    
    const res = await fetch(`${GPAI_API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { 
        Accept: 'application/json', 
        Cookie: cookie,
        'User-Agent': 'middleware'
      },
    })
    
    console.log('[Middleware] Auth response status:', res.status)
    
    if (res.ok) {
      const userData = await res.json()
      console.log('[Middleware] Auth success, user:', userData?.email)
      return NextResponse.next()
    } else {
      const errorData = await res.text()
      console.log('[Middleware] Auth failed:', res.status, errorData)
    }
  } catch (error) {
    console.log('[Middleware] Auth error:', error)
  }
  
  console.log('[Middleware] Redirecting to sign-in')
  const url = new URL('/sign-in', request.url)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
